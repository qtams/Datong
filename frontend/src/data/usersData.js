import { generateDefaultPassword } from "../utils/userPassword";

/* =========================================================
   USER ROLE CONFIGURATION
========================================================= */

export const USER_ROLE_OPTIONS = [
  {
    value: "Admin",
    label: "Admin",
    description: "Full access to users, finance, reports and settings.",
  },

  {
    value: "Finance",
    label: "Finance",
    description: "Manage accounts, transactions, budgets and reports.",
  },

  {
    value: "Staff",
    label: "Staff",
    description: "Standard access for day-to-day workspace operations.",
  },

  {
    value: "Viewer",
    label: "Viewer",
    description: "Read-only access without editing permissions.",
  },
];

/* =========================================================
   SIMPLE ROLE ARRAY

   Keep this for filters and anywhere that only needs
   the role name.
========================================================= */

export const USER_ROLES = USER_ROLE_OPTIONS.map((role) => role.value);

/* =========================================================
   STORAGE
========================================================= */

export const USER_STORAGE_KEY = "datong_users";

/* =========================================================
   SAMPLE USERS
========================================================= */

const users = [
  {
    id: "USR-001",
    fullname: "Juan Dela Cruz",
    nickname: "Juan",
    email: "juan@datong.com",
    birthday: "1990-06-15",
    role: "Admin",
    created_at: "2026-09-18T08:30:00.000Z",
    last_login: "2026-10-14T01:42:00.000Z",
  },

  {
    id: "USR-002",
    fullname: "Maria Santos",
    nickname: "Maria",
    email: "maria@datong.com",
    birthday: "1992-11-03",
    role: "Finance",
    created_at: "2026-09-22T04:15:00.000Z",
    last_login: "2026-10-13T10:24:00.000Z",
  },

  {
    id: "USR-003",
    fullname: "Carlo Reyes",
    nickname: "",
    email: "carlo@datong.com",
    birthday: "1996-04-22",
    role: "Staff",
    created_at: "2026-10-01T06:00:00.000Z",
    last_login: "2026-10-12T03:15:00.000Z",
  },

  {
    id: "USR-004",
    fullname: "Angela Lim",
    nickname: "Angie",
    email: "angela@datong.com",
    birthday: "1998-08-30",
    role: "Viewer",
    created_at: "2026-10-08T02:30:00.000Z",
    last_login: null,
  },

  {
    id: "USR-005",
    fullname: "Mark Villanueva",
    nickname: "Mark",
    email: "mark@datong.com",
    birthday: "1994-01-09",
    role: "Staff",
    created_at: "2026-10-10T07:45:00.000Z",
    last_login: "2026-10-14T00:58:00.000Z",
  },
];

/* =========================================================
   INITIAL USERS
========================================================= */

export const initialUsers = users.map((user) => ({
  ...user,

  default_password: generateDefaultPassword(user.birthday),
}));
