/* =========================================================
   API BASE
========================================================= */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/* =========================================================
   CSRF TOKEN
========================================================= */

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    method: "GET",

    credentials: "include",

    headers: {
      Accept: "application/json",

      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "Unable to initialize the request.");
  }

  return payload?.csrf_token || "";
}

/* =========================================================
   REQUEST
========================================================= */

async function request(path, { csrf = false, headers = {}, ...options } = {}) {
  const requestHeaders = {
    Accept: "application/json",

    "X-Requested-With": "XMLHttpRequest",

    ...headers,
  };

  /* =======================================================
     CSRF

     Required for authenticated Laravel session mutations.
  ======================================================= */

  if (csrf) {
    const csrfToken = await getCsrfToken();

    if (csrfToken) {
      requestHeaders["X-CSRF-TOKEN"] = csrfToken;
    }
  }

  /* =======================================================
     CONTENT TYPE

     IMPORTANT:
     Do NOT manually set multipart/form-data.

     The browser generates the correct multipart boundary
     automatically when body is FormData.
  ======================================================= */

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !requestHeaders["Content-Type"]
  ) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",

    ...options,

    headers: requestHeaders,
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
   BUILD FORM DATA
========================================================= */

function buildCardFormData(values) {
  const formData = new FormData();

  formData.append("name", values.name || "");

  formData.append("type", values.type || "");

  formData.append("status", values.status || "active");

  if (values.landscape_image instanceof File) {
    formData.append("landscape_image", values.landscape_image);
  }

  if (values.portrait_image instanceof File) {
    formData.append("portrait_image", values.portrait_image);
  }

  return formData;
}

/* =========================================================
   GET CARD CATALOG
========================================================= */

export async function getCardCatalog() {
  const response = await request("/api/card-catalog");

  return response?.data || [];
}

/* =========================================================
   GET CARD
========================================================= */

export async function getCard(id) {
  const response = await request(`/api/card-catalog/${id}`);

  return response?.data || null;
}

/* =========================================================
   CREATE CARD
========================================================= */

export async function createCard(values) {
  const response = await request("/api/card-catalog", {
    method: "POST",

    csrf: true,

    body: buildCardFormData(values),
  });

  return response?.data || null;
}

/* =========================================================
   UPDATE CARD

   Backend intentionally uses POST because the request can
   contain multipart image files.
========================================================= */

export async function updateCard(id, values) {
  const response = await request(`/api/card-catalog/${id}`, {
    method: "POST",

    csrf: true,

    body: buildCardFormData(values),
  });

  return response?.data || null;
}

/* =========================================================
   DELETE CARD
========================================================= */

export async function deleteCard(id) {
  await request(`/api/card-catalog/${id}`, {
    method: "DELETE",

    csrf: true,
  });
}
