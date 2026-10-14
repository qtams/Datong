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

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const validationErrors = payload?.errors;

    const firstValidationError = validationErrors
      ? Object.values(validationErrors).flat().find(Boolean)
      : null;

    const message =
      firstValidationError || payload?.message || "Something went wrong.";

    const error = new Error(message);

    error.status = response.status;

    error.errors = validationErrors || {};

    throw error;
  }

  return payload;
}

/* =========================================================
   USERS
========================================================= */

export async function getUsers() {
  const response = await request("/api/users");

  return response?.data || [];
}

/* =========================================================
   PAYLOAD
========================================================= */

function buildUserPayload(values) {
  return {
    fullname: values.fullname,

    nickname: values.nickname,

    username: values.username,

    email: values.email,

    birthday: values.birthday,

    role: values.role,
  };
}

/* =========================================================
   CREATE
========================================================= */

export async function createUser(values) {
  return request("/api/users", {
    method: "POST",

    body: JSON.stringify(buildUserPayload(values)),
  });
}

/* =========================================================
   UPDATE
========================================================= */

export async function updateUser(id, values) {
  return request(`/api/users/${id}`, {
    method: "PUT",

    body: JSON.stringify(buildUserPayload(values)),
  });
}

/* =========================================================
   DELETE
========================================================= */

export async function deleteUser(id) {
  await request(`/api/users/${id}`, {
    method: "DELETE",
  });
}
