export function normalizeMoneyInput(value) {
  const parts = String(value || "").replace(/[^\d.]/g, "").split(".");
  return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}` : parts[0];
}

export function moneyValue(value) {
  const amount = normalizeMoneyInput(value).replace(/\.$/, "");
  return amount.startsWith(".") ? `0${amount}` : amount || "0";
}

export function moneyToCents(value) {
  const amount = String(value);
  if (!/^\d{1,13}(?:\.\d{1,2})?$/.test(amount)) return null;
  const [whole, fraction = ""] = amount.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function formatGoalMoney(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency", currency: "PHP", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
