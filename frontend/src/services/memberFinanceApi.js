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

    "Content-Type": "application/json",

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

export async function getCashAccount() {
  const response = await request("/api/member-finance/cash", {
    method: "GET",
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
