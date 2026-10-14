import { getMemberIdToken } from "./memberFirebaseAuth";

/* =========================================================
   API BASE
========================================================= */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/* =========================================================
   REQUEST
========================================================= */

async function request(path, { token = null, ...options } = {}) {
  const idToken = token || (await getMemberIdToken());

  if (!idToken) {
    const error = new Error("Firebase authentication is required.");

    error.status = 401;

    throw error;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: {
      Accept: "application/json",

      "Content-Type": "application/json",

      Authorization: `Bearer ${idToken}`,

      ...options.headers,
    },
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
   SYNC MEMBER

   Called after:
   - registration
   - email login
   - Google login
========================================================= */

export async function syncMember(profile = {}, token = null) {
  const response = await request("/api/member-auth/sync", {
    token,

    method: "POST",

    body: JSON.stringify({
      fullname: profile.fullname || undefined,

      nickname: profile.nickname || undefined,

      username: profile.username || undefined,
    }),
  });

  return response?.member;
}

/* =========================================================
   CURRENT MEMBER
========================================================= */

export async function getCurrentMember(token = null) {
  const response = await request("/api/member-auth/me", {
    token,

    method: "GET",
  });

  return response?.member;
}
