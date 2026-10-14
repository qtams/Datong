import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  BarChart3,
  FileText,
  UsersRound,
  UserRoundCheck,
  Settings,
  LogOut,
} from "lucide-react";

/* =========================================================
   MAIN SIDEBAR NAVIGATION

   Centralized sidebar configuration.
   Add or remove menu items here instead of editing
   Sidebar.jsx directly.
========================================================= */

export const sidebarNavigation = [
  /* =======================================================
     MENU
  ======================================================= */

  {
    id: "menu",
    title: "Menu",

    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
      },
    ],
  },

  /* =======================================================
     FINANCE
  ======================================================= */

  {
    id: "finance",
    title: "Finance",

    items: [
      {
        id: "cards",
        label: "Cards",
        icon: CreditCard,
        path: "/cards",
      },

      {
        id: "transactions",
        label: "Transactions",
        icon: ArrowLeftRight,
        path: "/transactions",
      },

      {
        id: "budgets",
        label: "Budgets",
        icon: PieChart,
        path: "/budgets",
      },

      {
        id: "savings-goals",
        label: "Savings Goals",
        icon: PiggyBank,
        path: "/savings-goals",
      },
    ],
  },

  /* =======================================================
     INSIGHTS
  ======================================================= */

  {
    id: "insights",
    title: "Insights",

    items: [
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        path: "/analytics",
      },

      {
        id: "reports",
        label: "Reports",
        icon: FileText,
        path: "/reports",
      },
    ],
  },

  /* =======================================================
     ADMIN
  ======================================================= */

  {
    id: "admin",
    title: "Admin",

    items: [
      {
        id: "users",
        label: "Users",
        icon: UsersRound,
        path: "/users",
      },

      {
        id: "members",
        label: "Members",
        icon: UserRoundCheck,
        path: "/members",
      },
    ],
  },
];

/* =========================================================
   ACCOUNT / SYSTEM ACTIONS
========================================================= */

export const sidebarAccountActions = [
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },

  {
    id: "logout",
    label: "Log out",
    icon: LogOut,
    danger: true,
  },
];
