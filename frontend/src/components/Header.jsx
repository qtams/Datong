import { useEffect, useRef, useState } from "react";

import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { useNavigate } from "react-router-dom";

import iconBlack from "../assets/logos/datong_icon_black.webp";

/* =========================================================
   HEADER
========================================================= */

function Header({
  userName = "there",
  userFullName = "User",
  userRole = "User",
  userInitials = "U",
  onLogout,
}) {
  const navigate = useNavigate();

  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);

  /* =======================================================
     CLOSE ON OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [profileOpen]);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  /* =======================================================
     PROFILE
  ======================================================= */

  const handleProfile = () => {
    setProfileOpen(false);

    navigate("/profile");
  };

  /* =======================================================
     SETTINGS
  ======================================================= */

  const handleSettings = () => {
    setProfileOpen(false);

    navigate("/settings");
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    setProfileOpen(false);

    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  return (
    <header
      className="
        sticky
        top-0
        z-30
        h-[72px]
        border-b
        border-gray-200
        bg-white
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          gap-4
          px-4
          sm:px-5
          lg:px-6
        "
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            gap-3
          "
        >
          {/* =================================================
              MOBILE LOGO
          ================================================= */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              lg:hidden
            "
          >
            <img
              src={iconBlack}
              alt="Datong"
              className="
                h-10
                w-10
                object-contain
              "
            />
          </div>

          {/* =================================================
              GREETING
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              items-baseline
              gap-2
              sm:gap-2.5
            "
          >
            <h2
              className="
                shrink-0
                text-[19px]
                font-semibold
                leading-none
                tracking-[-0.035em]
                text-gray-950
                sm:text-[20px]
                lg:text-[22px]
              "
            >
              Hi {userName}!
            </h2>

            <p
              className="
                truncate
                text-[12px]
                font-normal
                leading-none
                text-gray-400
                sm:text-[13px]
                lg:text-[14px]
              "
            >
              Welcome back
            </p>
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
          "
        >
          {/* =================================================
              SEARCH
          ================================================= */}

          <div
            className="
              relative
              mr-2
              hidden
              md:block
            "
          >
            <Search
              size={15}
              strokeWidth={1.6}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="search"
              placeholder="Search..."
              className="
                h-9
                w-[230px]
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                pl-9
                pr-3
                text-[12px]
                text-gray-700
                outline-none
                transition-all
                placeholder:text-gray-400
                focus:border-gray-300
                focus:bg-white
                focus:ring-2
                focus:ring-gray-100
              "
            />
          </div>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-500
              transition-colors
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            <Bell size={17} strokeWidth={1.6} />

            <span
              className="
                absolute
                right-[8px]
                top-[7px]
                h-[6px]
                w-[6px]
                rounded-full
                bg-black
                ring-2
                ring-white
              "
            />
          </button>

          {/* =================================================
              PROFILE SEPARATOR
          ================================================= */}

          <div
            className="
              mx-2
              hidden
              h-6
              w-px
              bg-gray-200
              sm:block
            "
          />

          {/* =================================================
              PROFILE
          ================================================= */}

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className={`
                flex
                items-center
                gap-2.5
                rounded-xl
                px-1.5
                py-1
                outline-none
                transition-colors
                [-webkit-tap-highlight-color:transparent]

                ${profileOpen ? "bg-gray-100" : "hover:bg-gray-100"}
              `}
            >
              {/* AVATAR */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  text-[10px]
                  font-semibold
                  text-white
                "
              >
                {userInitials}
              </div>

              {/* PROFILE INFO */}

              <div
                className="
                  hidden
                  min-w-[72px]
                  max-w-[150px]
                  text-left
                  sm:block
                "
              >
                <p
                  className="
                    truncate
                    text-[12px]
                    font-medium
                    leading-tight
                    text-gray-900
                  "
                >
                  {userFullName}
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-[9px]
                    leading-none
                    text-gray-400
                  "
                >
                  {userRole}
                </p>
              </div>

              {/* CHEVRON */}

              <motion.div
                initial={false}
                animate={{
                  rotate: profileOpen ? 180 : 0,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="hidden sm:block"
              >
                <ChevronDown
                  size={13}
                  strokeWidth={1.6}
                  className="text-gray-400"
                />
              </motion.div>
            </button>

            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  role="menu"
                  initial={{
                    opacity: 0,
                    y: -6,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -5,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.14,
                    ease: "easeOut",
                  }}
                  className="
                    absolute
                    right-0
                    top-[calc(100%+10px)]
                    z-[100]
                    w-[230px]
                    max-w-[calc(100vw-2rem)]
                    overflow-hidden
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    shadow-[0_18px_50px_rgba(0,0,0,0.14)]
                  "
                >
                  {/* =========================================
                      USER INFORMATION
                  ========================================= */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      border-b
                      border-gray-100
                      px-3.5
                      py-3.5
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-black
                        text-[10px]
                        font-semibold
                        text-white
                      "
                    >
                      {userInitials}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-[11px]
                          font-semibold
                          text-gray-900
                        "
                      >
                        {userFullName}
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-[9px]
                          text-gray-400
                        "
                      >
                        {userRole}
                      </p>
                    </div>
                  </div>

                  {/* =========================================
                      MENU
                  ========================================= */}

                  <div className="p-1.5">
                    {/* PROFILE */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleProfile}
                      className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-2.5
                        py-2.5
                        text-left
                        transition-colors
                        hover:bg-gray-50
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-gray-100
                          text-gray-500
                          transition-colors
                          group-hover:bg-gray-200
                          group-hover:text-gray-900
                        "
                      >
                        <UserRound size={14} strokeWidth={1.6} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px]
                            font-medium
                            text-gray-900
                          "
                        >
                          Profile
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[9px]
                            text-gray-400
                          "
                        >
                          View your account
                        </p>
                      </div>
                    </button>

                    {/* SETTINGS */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSettings}
                      className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-2.5
                        py-2.5
                        text-left
                        transition-colors
                        hover:bg-gray-50
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-gray-100
                          text-gray-500
                          transition-colors
                          group-hover:bg-gray-200
                          group-hover:text-gray-900
                        "
                      >
                        <Settings size={14} strokeWidth={1.6} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px]
                            font-medium
                            text-gray-900
                          "
                        >
                          Settings
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[9px]
                            text-gray-400
                          "
                        >
                          Manage preferences
                        </p>
                      </div>
                    </button>

                    {/* DIVIDER */}

                    <div className="my-1.5 h-px bg-gray-100" />

                    {/* LOGOUT */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-2.5
                        py-2.5
                        text-left
                        transition-colors
                        hover:bg-red-50
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-red-50
                          text-red-500
                          transition-colors
                          group-hover:bg-red-100
                        "
                      >
                        <LogOut size={14} strokeWidth={1.6} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px]
                            font-medium
                            text-red-500
                          "
                        >
                          Log out
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[9px]
                            text-red-400
                          "
                        >
                          Sign out of your account
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
