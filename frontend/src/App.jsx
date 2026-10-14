import { useEffect, useLayoutEffect, useState } from "react";

import { Navigate, useLocation, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";

import AppToaster from "./components/feedback/AppToaster";

import LoginPage from "./auth/LoginPage";

import { useAuth } from "./auth/AuthContext";

import AppRoutes, { getPageMeta } from "./routes/AppRoutes";

import useLocalStorageState from "./hooks/useLocalStorageState";

/* =========================================================
   STORAGE
========================================================= */

const SIDEBAR_COLLAPSED_KEY = "datong_sidebar_collapsed";

/* =========================================================
   PAGE SKELETON DURATION
========================================================= */

const PAGE_SKELETON_DURATION = 350;

/* =========================================================
   USER INITIALS
========================================================= */

function getInitials(value) {
  if (!value) {
    return "U";
  }

  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

/* =========================================================
   GREETING NAME

   Priority:
   1. Nickname
   2. Full name
   3. Username
   4. "there"
========================================================= */

function getGreetingName(user) {
  const nickname = user?.nickname?.trim();

  if (nickname) {
    return nickname;
  }

  const fullName = user?.fullname?.trim();

  if (fullName) {
    return fullName;
  }

  const username = user?.username?.trim();

  if (username) {
    return username;
  }

  return "there";
}

/* =========================================================
   DISPLAY NAME
========================================================= */

function getDisplayName(user) {
  return user?.fullname?.trim() || user?.username?.trim() || "User";
}

/* =========================================================
   APP
========================================================= */

function App() {
  const navigate = useNavigate();

  const location = useLocation();

  const { user, loading: authLoading, logout } = useAuth();

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorageState(
    SIDEBAR_COLLAPSED_KEY,
    false,
  );

  /* =======================================================
     PAGE SKELETON
  ======================================================= */

  const [pageLoading, setPageLoading] = useState(true);

  /* =======================================================
     CURRENT PAGE
  ======================================================= */

  const currentPage = getPageMeta(location.pathname);

  /* =======================================================
     PAGE CHANGE SKELETON

     Only the current page content changes to its
     skeleton while navigating.

     Header, sidebar and mobile navigation stay mounted.
  ======================================================= */

  useLayoutEffect(() => {
    setPageLoading(true);

    const timer = window.setTimeout(() => {
      setPageLoading(false);
    }, PAGE_SKELETON_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  /* =======================================================
     SCROLL TO TOP
  ======================================================= */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  /* =======================================================
     SIDEBAR COLLAPSE
  ======================================================= */

  const handleSidebarCollapse = () => {
    setSidebarCollapsed((current) => !current);
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigate = (item) => {
    if (!item?.path) {
      return;
    }

    if (location.pathname === item.path) {
      return;
    }

    navigate(item.path);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);

      toast.error("Unable to log out cleanly.");
    }
  };

  /* =======================================================
     AUTH INITIALIZATION
  ======================================================= */

  if (authLoading) {
    return (
      <>
        <AppToaster />

        <div className="min-h-screen bg-[#f7f7f8]" />
      </>
    );
  }

  /* =======================================================
     GUEST
  ======================================================= */

  if (!user) {
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }

    return (
      <>
        <AppToaster />

        <LoginPage />
      </>
    );
  }

  /* =======================================================
     LOGGED IN USER ON LOGIN PAGE
  ======================================================= */

  if (location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  /* =======================================================
     APPLICATION
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <AppToaster />

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarCollapse}
        currentPage={currentPage.id}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* ===================================================
          MAIN APPLICATION
      =================================================== */}

      <div
        className={`
          min-h-screen
          transition-[padding-left]
          duration-300
          ease-out

          ${sidebarCollapsed ? "lg:pl-[84px]" : "lg:pl-[220px]"}
        `}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <Header
          userName={getGreetingName(user)}
          userFullName={getDisplayName(user)}
          userRole={user?.role || "User"}
          userInitials={getInitials(getDisplayName(user))}
          onLogout={handleLogout}
        />

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className="
            px-4
            pt-5
            pb-[calc(150px+env(safe-area-inset-bottom))]
            sm:px-5
            lg:px-6
            lg:pb-5
          "
        >
          <AppRoutes loading={pageLoading} />
        </main>
      </div>

      {/* ===================================================
          MOBILE NAVIGATION
      =================================================== */}

      <MobileNavigation />
    </div>
  );
}

export default App;
