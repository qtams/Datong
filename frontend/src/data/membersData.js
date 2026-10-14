/* =========================================================
   MEMBER REQUIREMENTS
========================================================= */

export const MEMBER_REQUIREMENTS = [
  {
    key: "fullname",
    label: "Full name",
  },

  {
    key: "nickname",
    label: "Nickname",
  },

  {
    key: "username",
    label: "Username",
  },

  {
    key: "password_set",
    label: "Password setup",
  },

  {
    key: "mobile_number",
    label: "Mobile number",
  },

  {
    key: "location",
    label: "Location",
  },

  {
    key: "email",
    label: "Email address",
  },
];

/* =========================================================
   HAS VALUE
========================================================= */

function hasValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
}

/* =========================================================
   VERIFICATION
========================================================= */

export function getMemberVerification(member) {
  const requirements = MEMBER_REQUIREMENTS.map((requirement) => {
    const completed =
      requirement.key === "password_set"
        ? member?.password_set === true
        : hasValue(member?.[requirement.key]);

    return {
      ...requirement,

      completed,
    };
  });

  const completed = requirements.filter(
    (requirement) => requirement.completed,
  ).length;

  const total = requirements.length;

  const verified = completed === total;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    verified,

    status: verified ? "Verified" : "Incomplete",

    completed,

    total,

    percentage,

    requirements,
  };
}

/* =========================================================
   FILTERS
========================================================= */

export const MEMBER_STATUS_OPTIONS = ["Verified", "Incomplete"];
