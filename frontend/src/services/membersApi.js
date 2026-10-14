/* =========================================================
   API BASE
========================================================= */

const API_BASE_URL = (
  import.meta.env
    .VITE_API_URL || ""
).replace(/\/$/, "");

/* =========================================================
   REQUEST
========================================================= */

async function request(
  path,
  options = {},
) {
  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        credentials:
          "include",

        ...options,

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          "X-Requested-With":
            "XMLHttpRequest",

          ...options.headers,
        },
      },
    );

  if (
    response.status ===
    204
  ) {
    return null;
  }

  const payload =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const error =
      new Error(
        payload?.message ||
          "Something went wrong.",
      );

    error.status =
      response.status;

    error.errors =
      payload?.errors || {};

    throw error;
  }

  return payload;
}

/* =========================================================
   MEMBERS
========================================================= */

export async function getMembers() {
  const response =
    await request(
      "/api/members",
    );

  return response?.data || [];
}

/* =========================================================
   MEMBER
========================================================= */

export async function getMember(
  memberId,
) {
  const response =
    await request(
      `/api/members/${encodeURIComponent(
        memberId,
      )}`,
    );

  return response?.data;
}