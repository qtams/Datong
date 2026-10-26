import { getMemberIdToken } from "./memberFirebaseAuth";

/* =========================================================
   API BASE
========================================================= */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/* =========================================================
   REQUEST
========================================================= */

async function request(path, { token = null, headers = {}, ...options } = {}) {
  const idToken = token || (await getMemberIdToken());

  if (!idToken) {
    const error = new Error("Firebase authentication is required.");

    error.status = 401;

    throw error;
  }

  const requestHeaders = {
    Accept: "application/json",

    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),

    Authorization: `Bearer ${idToken}`,

    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: requestHeaders,
  });

  const payload =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const validationErrors = payload?.errors;

    const firstError = validationErrors
      ? Object.values(validationErrors).flat().find(Boolean)
      : null;

    const error = new Error(
      firstError || payload?.message || "Something went wrong.",
    );

    error.status = response.status;

    error.errors = validationErrors || {};

    throw error;
  }

  return payload;
}

/* =========================================================
   SUMMARY
========================================================= */

export async function getFinanceSummary() {
  const response = await request("/api/member-finance/summary", {
    method: "GET",
  });

  return (
    response?.data || {
      savings: "0.00",
      actual_money: "0.00",
      total_money: "0.00",
      currency: "PHP",
    }
  );
}

/* =========================================================
   PROVIDER CATALOG
========================================================= */

export async function getMemberCardCatalog() {
  const response = await request("/api/member-finance/card-catalog", {
    method: "GET",
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/* =========================================================
   MEMBER CARDS
========================================================= */

export async function getMemberCards() {
  const response = await request("/api/member-finance/cards", {
    method: "GET",
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/* =========================================================
   ADD MEMBER CARD
========================================================= */

export async function createMemberCard({ card_id, name, amount }) {
  const response = await request("/api/member-finance/cards", {
    method: "POST",

    body: JSON.stringify({
      card_id,
      name,
      amount,
    }),
  });

  return response?.data;
}

/* =========================================================
   UPDATE MEMBER CARD
========================================================= */

export async function updateMemberCard(memberCardId, values) {
  const response = await request(`/api/member-finance/cards/${memberCardId}`, {
    method: "PUT",

    body: JSON.stringify(values),
  });

  return response?.data;
}

/* =========================================================
   DELETE MEMBER CARD
========================================================= */

export async function deleteMemberCard(memberCardId) {
  return request(`/api/member-finance/cards/${memberCardId}`, {
    method: "DELETE",
  });
}

/* =========================================================
   ON-HAND CASH / DATONG WALLET
========================================================= */

export async function getCashAccount({ signal } = {}) {
  const response = await request("/api/member-finance/cash", {
    method: "GET",

    signal,
  });

  return response?.data;
}

/* =========================================================
   UPDATE WALLET BALANCE

   This SETS the current wallet balance.

   Example:

   updateCashBalance(15000)

   Current wallet becomes:
   ₱15,000.00
========================================================= */

export async function updateCashBalance(amount) {
  const response = await request("/api/member-finance/cash", {
    method: "PUT",

    body: JSON.stringify({
      amount,
    }),
  });

  return response?.data;
}

/* =========================================================
   SAVINGS GOALS
========================================================= */

function mapSavingsGoal(goal) {
  return {
    id: String(goal.id),
    name: goal.name,
    iconId: goal.icon_id,
    imageData: goal.image_url || "",
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    targetDate: goal.target_date || "",
    walletLinked: true,
    version: goal.version,
    createdAt: goal.created_at,
  };
}

function savingsGoalFormData(values, version) {
  const body = new FormData();

  body.append("name", values.name);
  body.append("icon_id", values.iconId);
  body.append("target_amount", String(values.targetAmount));
  body.append("current_amount", String(values.currentAmount));
  body.append("target_date", values.targetDate || "");

  if (version !== undefined) {
    body.append("version", String(version));
    body.append("_method", "PUT");
  }

  if (values.imageData?.startsWith("data:")) {
    const image = values.imageData.match(
      /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/,
    );

    if (!image) {
      throw new Error("Choose a JPEG, PNG, or WebP goal photo.");
    }

    const bytes = Uint8Array.from(atob(image[2]), (character) =>
      character.charCodeAt(0),
    );
    const extension = image[1] === "image/jpeg" ? "jpg" : image[1].split("/")[1];

    body.append(
      "image",
      new Blob([bytes], { type: image[1] }),
      `goal.${extension}`,
    );
  } else if (!values.imageData) {
    body.append("remove_image", "1");
  }

  return body;
}

export async function getSavingsGoals({ signal } = {}) {
  const response = await request("/api/member-finance/savings-goals", { signal });

  if (!Array.isArray(response?.data)) {
    throw new Error("Unable to read your savings goals. Try again.");
  }

  return response.data.map(mapSavingsGoal);
}

export async function getSavingsGoal(goalId, { signal } = {}) {
  const response = await request(`/api/member-finance/savings-goals/${goalId}`, { signal });
  return mapSavingsGoal(response.data);
}

export async function getSavingsGoalEntries(goalId, { page = 1, signal } = {}) {
  const response = await request(`/api/member-finance/savings-goals/${goalId}/entries?page=${page}`, { signal });
  return {
    entries: response.data.map((entry) => ({
      id: String(entry.id), type: entry.type, amount: entry.amount,
      goalBalanceAfter: entry.goal_balance_after,
      walletBalanceAfter: entry.wallet_balance_after,
      createdAt: entry.created_at,
    })),
    hasMore: response.meta.has_more,
  };
}

export async function transferSavingsGoal(goalId, { direction, amount, version }) {
  const response = await request(`/api/member-finance/savings-goals/${goalId}/transfers`, {
    method: "POST",
    body: JSON.stringify({ direction, amount, version }),
  });
  return { goal: mapSavingsGoal(response.data.goal), wallet: response.data.wallet };
}

export async function createSavingsGoal(values) {
  const response = await request("/api/member-finance/savings-goals", {
    method: "POST",
    body: savingsGoalFormData(values),
  });

  return { goal: mapSavingsGoal(response.data.goal), wallet: response.data.wallet };
}

export async function updateSavingsGoal(goalId, values, version) {
  const response = await request(`/api/member-finance/savings-goals/${goalId}`, {
    method: "POST",
    body: savingsGoalFormData(values, version),
  });

  return { goal: mapSavingsGoal(response.data.goal), wallet: response.data.wallet };
}

export async function deleteSavingsGoal(goalId, version) {
  const response = await request(`/api/member-finance/savings-goals/${goalId}`, {
    method: "DELETE",
    body: JSON.stringify({ version }),
  });

  return response.data;
}

/* =========================================================
   TRANSFERS
========================================================= */

export async function getMemberTransfers() {
  const response = await request("/api/member-finance/transfers", {
    method: "GET",
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/* =========================================================
   CREATE TRANSFER

   CARD -> WALLET

   {
     from_type: "card",
     from_id: 1,
     to_type: "cash",
     amount: 1000
   }

   WALLET -> CARD

   {
     from_type: "cash",
     to_type: "card",
     to_id: 1,
     amount: 1000
   }
========================================================= */

export async function createTransfer({
  from_type,
  from_id = null,
  to_type,
  to_id = null,
  amount,
  note = null,
}) {
  const response = await request("/api/member-finance/transfers", {
    method: "POST",

    body: JSON.stringify({
      from_type,
      from_id,
      to_type,
      to_id,
      amount,
      note: note || undefined,
    }),
  });

  return response?.data;
}
