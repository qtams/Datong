import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";

const source = await readFile(new URL("./memberFinanceApi.js", import.meta.url), "utf8");
const goal = {
  id: 7,
  name: "Travel",
  icon_id: "travel",
  image_url: "https://example.test/goal.jpg",
  target_amount: "1000.00",
  current_amount: "10.05",
  target_date: null,
  version: 3,
};
const values = {
  name: "Travel", iconId: "travel", imageData: "",
  targetAmount: "1000.00", currentAmount: "10.05", targetDate: "",
};

async function client(fetch, token = "member-token") {
  const context = createContext({ fetch, FormData, Blob, Uint8Array, atob, Error });
  const module = new SourceTextModule(source, {
    context,
    initializeImportMeta(meta) {
      meta.env = { VITE_API_URL: "https://api.example.test/" };
    },
  });
  await module.link((specifier) => {
    assert.equal(specifier, "./memberFirebaseAuth");
    return new SyntheticModule(["getMemberIdToken"], function () {
      this.setExport("getMemberIdToken", async () => token);
    }, { context });
  });
  await module.evaluate();
  return module.namespace;
}

test("creating a goal sends exact amounts and leaves multipart headers to the browser", async () => {
  const api = await client(async (url, options) => {
    assert.equal(url, "https://api.example.test/api/member-finance/savings-goals");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer member-token");
    assert.equal(options.headers["Content-Type"], undefined);
    assert.equal(options.body.get("current_amount"), "10.05");
    assert.equal(options.body.get("remove_image"), "1");
    assert.equal(options.body.get("_method"), null);
    return Response.json({ data: { goal, wallet: { balance: "989.95" } } }, { status: 201 });
  });
  const result = await api.createSavingsGoal(values);
  assert.equal(result.goal.id, "7");
  assert.equal(result.goal.currentAmount, "10.05");
  assert.equal(result.wallet.balance, "989.95");
});

test("photo updates include PUT spoofing and the server version", async () => {
  const api = await client(async (url, options) => {
    assert.equal(url.endsWith("/savings-goals/7"), true);
    assert.equal(options.method, "POST");
    assert.equal(options.body.get("_method"), "PUT");
    assert.equal(options.body.get("version"), "3");
    assert.equal(options.body.get("remove_image"), null);
    assert.equal(options.body.get("image").type, "image/jpeg");
    assert.equal(options.body.get("image").name, "goal.jpg");
    assert.equal(options.headers["Content-Type"], undefined);
    return Response.json({ data: { goal, wallet: { balance: "989.95" } } });
  });
  await api.updateSavingsGoal("7", { ...values, imageData: "data:image/jpeg;base64,aW1hZ2U=" }, 3);
});

test("editing a saved photo preserves its asset without reuploading", async () => {
  const api = await client(async (_url, options) => {
    assert.equal(options.body.get("image"), null);
    assert.equal(options.body.get("remove_image"), null);
    return Response.json({ data: { goal, wallet: { balance: "989.95" } } });
  });
  await api.updateSavingsGoal("7", { ...values, imageData: goal.image_url }, 3);
});

test("deletion sends the version and returns the wallet confirmed by the server", async () => {
  const api = await client(async (_url, options) => {
    assert.equal(options.method, "DELETE");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { version: 3 });
    return Response.json({ data: { wallet: { balance: "1000.00" } } });
  });
  assert.equal((await api.deleteSavingsGoal("7", 3)).wallet.balance, "1000.00");
});

test("loading goals preserves decimal strings and remote photo URLs", async () => {
  const api = await client(async () => Response.json({ data: [goal] }));
  const [saved] = await api.getSavingsGoals();
  assert.equal(saved.imageData, goal.image_url);
  assert.equal(saved.targetAmount, "1000.00");
  assert.equal(saved.currentAmount, "10.05");
  assert.equal(saved.targetDate, "");
  assert.equal(saved.version, 3);
});

test("server validation failures retain field errors and status", async () => {
  const api = await client(async () => Response.json({
    message: "Invalid amount", errors: { current_amount: ["Insufficient wallet balance."] },
  }, { status: 422 }));
  await assert.rejects(api.createSavingsGoal(values), (error) => {
    assert.equal(error.status, 422);
    assert.equal(error.message, "Insufficient wallet balance.");
    assert.equal(error.errors.current_amount[0], "Insufficient wallet balance.");
    return true;
  });
});

test("missing Firebase authentication never sends a financial request", async () => {
  const api = await client(() => assert.fail("A request must not be sent"), null);
  await assert.rejects(api.createSavingsGoal(values), (error) => error.status === 401);
});

test("opening a single goal loads its saved date and balance", async () => {
  const api = await client(async (url) => {
    assert.equal(url, "https://api.example.test/api/member-finance/savings-goals/7");
    return Response.json({ data: { ...goal, target_date: "2030-12-01" } });
  });
  const saved = await api.getSavingsGoal("7");
  assert.equal(saved.targetDate, "2030-12-01");
  assert.equal(saved.currentAmount, "10.05");
});

test("goal transfers send a delta and version without editing goal metadata", async () => {
  const api = await client(async (url, options) => {
    assert.equal(url, "https://api.example.test/api/member-finance/savings-goals/7/transfers");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { direction: "out", amount: "0.05", version: 3 });
    return Response.json({ data: { goal: { ...goal, current_amount: "10.00", version: 4 }, wallet: { balance: "990.00" } } });
  });
  const result = await api.transferSavingsGoal("7", { direction: "out", amount: "0.05", version: 3 });
  assert.equal(result.goal.currentAmount, "10.00");
  assert.equal(result.goal.version, 4);
  assert.equal(result.wallet.balance, "990.00");
});

test("activity loads a specific page and preserves transaction dates and decimal amounts", async () => {
  const api = await client(async (url) => {
    assert.equal(url, "https://api.example.test/api/member-finance/savings-goals/7/entries?page=2");
    return Response.json({ data: [{ id: 9, type: "deposit", amount: "0.01", created_at: "2026-10-26T10:00:00Z" }], meta: { has_more: false } });
  });
  const result = await api.getSavingsGoalEntries("7", { page: 2 });
  assert.equal(result.entries[0].amount, "0.01");
  assert.equal(result.entries[0].createdAt, "2026-10-26T10:00:00Z");
  assert.equal(result.hasMore, false);
});
