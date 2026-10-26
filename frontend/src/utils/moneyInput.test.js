import assert from "node:assert/strict";
import { test } from "node:test";
import { moneyToCents, moneyValue, normalizeMoneyInput } from "./moneyInput.js";

test("fractional and trailing-decimal input produces valid money strings", () => {
  assert.equal(moneyValue(".05"), "0.05");
  assert.equal(moneyValue("1."), "1");
  assert.equal(moneyValue(""), "0");
  assert.equal(normalizeMoneyInput("1,234.56"), "1234.56");
});

test("transfer previews calculate in exact cents", () => {
  assert.equal(moneyToCents("0.10") + moneyToCents("0.20"), 30);
  assert.equal(moneyToCents("1000.00") - moneyToCents("125.35"), 87465);
  assert.equal(moneyToCents("9999999999999.99"), 999999999999999);
});

test("invalid and over-precision amounts cannot become valid preview amounts", () => {
  for (const amount of ["-1", "1e2", "0.001", "10000000000000.00", "invalid"]) {
    assert.equal(moneyToCents(amount), null);
  }
});

test("using the full balance preserves its original decimal digits", () => {
  assert.equal(moneyValue("9999999999999.99"), "9999999999999.99");
});
