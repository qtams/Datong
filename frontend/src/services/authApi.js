/* =========================================================
   API BASE
========================================================= */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/* =========================================================
   REQUEST
========================================================= */

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",

    ...options,

    headers: {
      Accept: "application/json",

      "Content-Type": "application/json",

      "X-Requested-With": "XMLHttpRequest",

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

    const message = firstError || payload?.message || "Something went wrong.";

    const error = new Error(message);

    error.status = response.status;

    error.errors = validationErrors || {};

    throw error;
  }

  return payload;
}

/* =========================================================
   CSRF
========================================================= */

async function getCsrfToken() {
  const response = await request("/api/auth/csrf");

  return response?.csrf_token;
}

/* =========================================================
   LOGIN

   login can be:
   - username
   - email
========================================================= */

export async function loginUser({ login, password, remember = false }) {
  const csrfToken = await getCsrfToken();

  return request("/api/auth/login", {
    method: "POST",

    headers: {
      "X-CSRF-TOKEN": csrfToken,
    },

    body: JSON.stringify({
      login,
      password,
      remember,
    }),
  });
}

/* =========================================================
   CURRENT USER
========================================================= */

export async function getCurrentUser() {
  try {
    const response = await request("/api/auth/me");

    return response?.user || null;
  } catch (error) {
    if (error.status === 401) {
      return null;
    }

    throw error;
  }
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logoutUser() {
  const csrfToken = await getCsrfToken();

  return request("/api/auth/logout", {
    method: "POST",

    headers: {
      "X-CSRF-TOKEN": csrfToken,
    },
  });
}
