import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

import Dashboard from "../pages/Dashboard";

import CardsPage from "../pages/cards/CardsPage";

import CardCatalogPage from "../pages/cards/CardCatalogPage";

import UsersPage from "../pages/users/UsersPage";

import MembersPage from "../pages/members/MembersPage";

import MemberDetailsPage from "../pages/members/MemberDetailsPage";

import SavingsGoalsPage from "../pages/savings/SavingsGoalsPage";

/* =========================================================
   PAGE METADATA
========================================================= */

export const PAGE_META = {
  dashboard: {
    id: "dashboard",
    path: "/",
    title: "Dashboard",
    description: "Financial overview",
  },

  cards: {
    id: "cards",
    path: "/cards",
    title: "Cards",
    description: "Manage savings and actual money",
  },

  cardCatalog: {
    id: "card-catalog",
    path: "/card-catalog",
    title: "Card Catalog",
    description: "Manage available card providers",
  },

  transactions: {
    id: "transactions",
    path: "/transactions",
    title: "Transactions",
    description: "Manage financial activity",
  },

  budgets: {
    id: "budgets",
    path: "/budgets",
    title: "Budgets",
    description: "Manage budgets and spending limits",
  },

  savingsGoals: {
    id: "savings-goals",
    path: "/savings-goals",
    title: "Savings Goals",
    description: "Track savings goals and progress",
  },

  analytics: {
    id: "analytics",
    path: "/analytics",
    title: "Analytics",
    description: "Financial insights and performance",
  },

  reports: {
    id: "reports",
    path: "/reports",
    title: "Reports",
    description: "Financial reports and exports",
  },

  users: {
    id: "users",
    path: "/users",
    title: "Users",
    description: "User management",
  },

  members: {
    id: "members",
    path: "/members",
    title: "Members",
    description: "Registered website members",
  },

  memberDetails: {
    id: "members",
    path: "/members/:memberId",
    title: "Member Details",
    description: "Member account and verification details",
  },

  settings: {
    id: "settings",
    path: "/settings",
    title: "Settings",
    description: "Workspace preferences",
  },

  profile: {
    id: "profile",
    path: "/profile",
    title: "Profile",
    description: "Manage your account information",
  },
};

/* =========================================================
   NORMALIZE PATH
========================================================= */

function normalizePath(pathname) {
  if (!pathname) {
    return "/";
  }

  if (pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

/* =========================================================
   GET PAGE META
========================================================= */

export function getPageMeta(pathname) {
  const normalized = normalizePath(pathname);

  const exact = Object.values(PAGE_META).find(
    (page) => !page.path.includes(":") && page.path === normalized,
  );

  if (exact) {
    return exact;
  }

  if (normalized.startsWith("/members/")) {
    return PAGE_META.memberDetails;
  }

  return PAGE_META.dashboard;
}

/* =========================================================
   IS MEMBER
========================================================= */

function isPublicMember({ user, authType, isMember }) {
  const memberRole =
    String(user?.role || "")
      .trim()
      .toLowerCase() === "member";

  return isMember === true || authType === "member" || memberRole;
}

/* =========================================================
   MEMBER ONLY

   Cards / personal finance belongs to the Firebase Member.

   Internal staff are redirected to Card Catalog instead.
========================================================= */

function MemberOnlyRoute({ children }) {
  const auth = useAuth();

  if (!isPublicMember(auth)) {
    return <Navigate to="/card-catalog" replace />;
  }

  return children;
}

/* =========================================================
   INTERNAL ONLY
========================================================= */

function InternalOnlyRoute({ children }) {
  const auth = useAuth();

  if (isPublicMember(auth)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* =========================================================
   PLACEHOLDER SKELETON
========================================================= */

function ModulePlaceholderSkeleton() {
  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1600px]
      "
    >
      <div className="mb-6">
        <div
          className="
            mb-4
            flex
            items-center
            gap-2
          "
        >
          <div className="h-2.5 w-10 animate-pulse rounded-md bg-gray-200" />

          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-200" />

          <div className="h-2.5 w-16 animate-pulse rounded-md bg-gray-200" />
        </div>

        <div>
          <div className="h-6 w-32 animate-pulse rounded-md bg-gray-200" />

          <div className="mt-3 h-3 w-[280px] max-w-full animate-pulse rounded-md bg-gray-200" />
        </div>
      </div>

      <div
        className="
          rounded-xl

          border
          border-gray-200

          bg-white

          p-6
        "
      >
        <div
          className="
            flex
            min-h-[360px]
            items-center
            justify-center
          "
        >
          <div className="w-full max-w-[320px]">
            <div className="mx-auto h-11 w-11 animate-pulse rounded-xl bg-gray-200" />

            <div className="mx-auto mt-5 h-3.5 w-32 animate-pulse rounded-md bg-gray-200" />

            <div className="mx-auto mt-3 h-2.5 w-60 max-w-full animate-pulse rounded-md bg-gray-200" />

            <div className="mx-auto mt-2 h-2.5 w-44 max-w-full animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PLACEHOLDER
========================================================= */

function ModulePlaceholder({ title, description, loading = false }) {
  if (loading) {
    return <ModulePlaceholderSkeleton />;
  }

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1600px]
      "
    >
      <div
        className="
          flex
          min-h-[420px]
          items-center
          justify-center

          rounded-xl

          border
          border-gray-200

          bg-white

          p-6
        "
      >
        <div
          className="
            max-w-[320px]
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-4
              h-10
              w-10

              rounded-xl

              bg-gray-100
            "
          />

          <p
            className="
              text-[14px]
              font-semibold
              text-gray-900
            "
          >
            {title}
          </p>

          <p
            className="
              mt-1.5

              text-[11px]
              leading-5
              text-gray-400
            "
          >
            {description}
          </p>

          <div
            className="
              mx-auto
              mt-5
              h-px
              w-10
              bg-gray-200
            "
          />

          <p
            className="
              mt-4
              text-[10px]
              text-gray-400
            "
          >
            This module will be implemented next.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ROUTES
========================================================= */

function AppRoutes({ loading = false }) {
  return (
    <Routes>
      {/* ===================================================
          DASHBOARD
      =================================================== */}

      <Route
        path={PAGE_META.dashboard.path}
        element={<Dashboard loading={loading} />}
      />

      {/* ===================================================
          CARDS

          FIREBASE MEMBERS ONLY.

          Cards = Savings
          Cash = Actual Money
      =================================================== */}

      <Route
        path={PAGE_META.cards.path}
        element={
          <MemberOnlyRoute>
            <CardsPage loading={loading} />
          </MemberOnlyRoute>
        }
      />

      {/* ===================================================
          TRANSACTIONS
      =================================================== */}

      <Route
        path={PAGE_META.transactions.path}
        element={
          <ModulePlaceholder
            loading={loading}
            title={PAGE_META.transactions.title}
            description="Track income, expenses, transfers and financial activity."
          />
        }
      />

      {/* ===================================================
          BUDGETS
      =================================================== */}

      <Route
        path={PAGE_META.budgets.path}
        element={
          <ModulePlaceholder
            loading={loading}
            title={PAGE_META.budgets.title}
            description="Create spending limits and monitor budget performance."
          />
        }
      />

      {/* ===================================================
          SAVINGS GOALS
      =================================================== */}

      <Route
        path={PAGE_META.savingsGoals.path}
        element={<SavingsGoalsPage loading={loading} />}
      />

      {/* ===================================================
          ANALYTICS
      =================================================== */}

      <Route
        path={PAGE_META.analytics.path}
        element={
          <ModulePlaceholder
            loading={loading}
            title={PAGE_META.analytics.title}
            description="Review financial trends, metrics and performance."
          />
        }
      />

      {/* ===================================================
          REPORTS
      =================================================== */}

      <Route
        path={PAGE_META.reports.path}
        element={
          <ModulePlaceholder
            loading={loading}
            title={PAGE_META.reports.title}
            description="View, generate and export financial reports."
          />
        }
      />

      {/* ===================================================
          CARD CATALOG

          INTERNAL USERS ONLY.
      =================================================== */}

      <Route
        path={PAGE_META.cardCatalog.path}
        element={
          <InternalOnlyRoute>
            <CardCatalogPage loading={loading} />
          </InternalOnlyRoute>
        }
      />

      {/* ===================================================
          USERS
      =================================================== */}

      <Route
        path={PAGE_META.users.path}
        element={
          <InternalOnlyRoute>
            <UsersPage loading={loading} />
          </InternalOnlyRoute>
        }
      />

      {/* ===================================================
          MEMBERS
      =================================================== */}

      <Route
        path={PAGE_META.members.path}
        element={
          <InternalOnlyRoute>
            <MembersPage loading={loading} />
          </InternalOnlyRoute>
        }
      />

      {/* ===================================================
          MEMBER DETAILS
      =================================================== */}

      <Route
        path={PAGE_META.memberDetails.path}
        element={
          <InternalOnlyRoute>
            <MemberDetailsPage loading={loading} />
          </InternalOnlyRoute>
        }
      />

      {/* ===================================================
          SETTINGS
      =================================================== */}

      <Route
        path={PAGE_META.settings.path}
        element={
          <ModulePlaceholder
            loading={loading}
            title={PAGE_META.settings.title}
            description="Manage workspace preferences and application settings."
          />
        }
      />

      {/* ===================================================
          PROFILE
      =================================================== */}

      <Route
        path={PAGE_META.profile.path}
        element={
          <ModulePlaceholder
            loading={loading}
            title={PAGE_META.profile.title}
            description="Manage your personal information and account preferences."
          />
        }
      />

      {/* ===================================================
          OLD ACCOUNTS
      =================================================== */}

      <Route path="/accounts" element={<Navigate to="/cards" replace />} />

      {/* ===================================================
          OLD REGISTRATIONS
      =================================================== */}

      <Route
        path="/registrations"
        element={
          <InternalOnlyRoute>
            <Navigate to="/members" replace />
          </InternalOnlyRoute>
        }
      />

      {/* ===================================================
          UNKNOWN
      =================================================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
