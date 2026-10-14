import { useEffect, useMemo, useState } from "react";

import { MoreHorizontal } from "lucide-react";

import { AnimatePresence, motion, useDragControls } from "motion/react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

import { sidebarNavigation } from "../data/sidebarNavigation";

import { MobileNavigationSkeleton } from "./SkeletonLoader";

/* =========================================================
   PRIMARY MOBILE NAVIGATION

   Dashboard | Cards | More | Transactions | Savings
========================================================= */

const PRIMARY_IDS = ["dashboard", "cards", "transactions", "savings-goals"];

/* =========================================================
   MORE IDS
========================================================= */

const MORE_IDS = ["budgets", "analytics", "reports", "users", "members"];

/* =========================================================
   MEMBER RESTRICTED

   Firebase members cannot see/access:
   - Users
   - Members
========================================================= */

const MEMBER_RESTRICTED_IDS = new Set(["users", "members"]);

/* =========================================================
   MOTION
========================================================= */

const NAV_SPRING = {
  type: "spring",
  stiffness: 440,
  damping: 32,
  mass: 0.75,
};

const SHEET_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 36,
  mass: 0.9,
};

/* =========================================================
   FLATTEN NAVIGATION

   Add the original group ID to each navigation item.
========================================================= */

const ALL_NAVIGATION_ITEMS = sidebarNavigation.flatMap((group) =>
  group.items.map((item) => ({
    ...item,

    group: group.id,

    groupTitle: group.title,
  })),
);

/* =========================================================
   PATH MATCH
========================================================= */

function pathMatches(pathname, item) {
  if (!item?.path) {
    return false;
  }

  if (item.path === "/") {
    return pathname === "/";
  }

  if (item.id === "members") {
    return pathname === "/members" || pathname.startsWith("/members/");
  }

  return pathname === item.path;
}

/* =========================================================
   ACTIVE DOCK
========================================================= */

function getDockIdFromPath(pathname, primaryItems, moreItems) {
  const moreMatch = moreItems.some((item) => pathMatches(pathname, item));

  if (moreMatch) {
    return "more";
  }

  const primaryMatch = primaryItems.find((item) => pathMatches(pathname, item));

  if (primaryMatch) {
    return primaryMatch.id;
  }

  return "dashboard";
}

/* =========================================================
   MORE GRID ITEM
========================================================= */

function MoreGridItem({ item, active, onClick }) {
  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      whileTap={{
        scale: 0.92,
      }}
      className="
        group
        flex
        min-w-0
        flex-col
        items-center
        justify-start
        gap-2.5
        rounded-2xl
        px-1
        py-2
        text-center
        outline-none
        [-webkit-tap-highlight-color:transparent]
      "
    >
      <motion.div
        initial={false}
        animate={{
          scale: active ? 1.05 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 28,
        }}
        className={`
          flex
          h-[52px]
          w-[52px]
          items-center
          justify-center
          rounded-full
          transition-colors
          duration-200

          ${
            active
              ? "bg-white text-black"
              : "bg-white/[0.08] text-white/65 group-hover:bg-white/[0.12] group-hover:text-white"
          }
        `}
      >
        <Icon size={20} strokeWidth={1.7} />
      </motion.div>

      <span
        className={`
          max-w-[90px]
          text-[10px]
          font-medium
          leading-[1.25]

          ${active ? "text-white" : "text-white/55"}
        `}
      >
        {item.label}
      </span>
    </motion.button>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function MobileNavigationContent() {
  const navigate = useNavigate();

  const location = useLocation();

  const { user, isMember } = useAuth();

  const dragControls = useDragControls();

  const [moreOpen, setMoreOpen] = useState(false);

  /* =======================================================
     MEMBER ACCOUNT
  ======================================================= */

  const memberAccount =
    isMember === true || String(user?.role || "").toLowerCase() === "member";

  /* =======================================================
     PRIMARY ITEMS
  ======================================================= */

  const primaryItems = useMemo(
    () =>
      PRIMARY_IDS.map((id) =>
        ALL_NAVIGATION_ITEMS.find((item) => item.id === id),
      ).filter(Boolean),
    [],
  );

  /* =======================================================
     MORE ITEMS

     Members do not receive Users/Members.
  ======================================================= */

  const moreItems = useMemo(
    () =>
      MORE_IDS.map((id) => ALL_NAVIGATION_ITEMS.find((item) => item.id === id))
        .filter(Boolean)
        .filter(
          (item) => !memberAccount || !MEMBER_RESTRICTED_IDS.has(item.id),
        ),
    [memberAccount],
  );

  /* =======================================================
     MORE SECTIONS
  ======================================================= */

  const moreSections = useMemo(() => {
    const groupOrder = ["finance", "insights", "admin"];

    return groupOrder
      .map((groupId) => {
        const items = moreItems.filter((item) => item.group === groupId);

        const sourceGroup = sidebarNavigation.find(
          (group) => group.id === groupId,
        );

        return {
          id: groupId,

          title: sourceGroup?.title || groupId,

          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [moreItems]);

  /* =======================================================
     DOCK ITEMS
  ======================================================= */

  const dockItems = useMemo(
    () =>
      [
        primaryItems[0],

        primaryItems[1],

        {
          id: "more",
          label: "More",
          icon: MoreHorizontal,
          path: null,
        },

        primaryItems[2],

        primaryItems[3],
      ].filter(Boolean),
    [primaryItems],
  );

  /* =======================================================
     SELECTED DOCK
  ======================================================= */

  const [selectedDockId, setSelectedDockId] = useState(() =>
    getDockIdFromPath(location.pathname, primaryItems, moreItems),
  );

  /* =======================================================
     ACTIVE PATH
  ======================================================= */

  const isActivePath = (item) => pathMatches(location.pathname, item);

  /* =======================================================
     ROUTE SYNC
  ======================================================= */

  useEffect(() => {
    const nextDockId = getDockIdFromPath(
      location.pathname,
      primaryItems,
      moreItems,
    );

    setSelectedDockId(nextDockId);
  }, [location.pathname, primaryItems, moreItems]);

  /* =======================================================
     ACTIVE INDEX
  ======================================================= */

  const activeIndex = useMemo(() => {
    const index = dockItems.findIndex((item) => item.id === selectedDockId);

    return index >= 0 ? index : 0;
  }, [dockItems, selectedDockId]);

  /* =======================================================
     ACTIVE POSITION
  ======================================================= */

  const activeLeft = `${activeIndex * 20 + 10}%`;

  /* =======================================================
     DOCK NAVIGATION
  ======================================================= */

  const handleDockNavigate = (item) => {
    if (!item) {
      return;
    }

    if (item.id === "more") {
      setSelectedDockId("more");

      setMoreOpen(true);

      return;
    }

    if (!item.path) {
      return;
    }

    setSelectedDockId(item.id);

    setMoreOpen(false);

    if (location.pathname !== item.path) {
      navigate(item.path);
    }
  };

  /* =======================================================
     MORE NAVIGATION
  ======================================================= */

  const handleMoreNavigate = (item) => {
    if (!item?.path) {
      return;
    }

    if (memberAccount && MEMBER_RESTRICTED_IDS.has(item.id)) {
      return;
    }

    setSelectedDockId("more");

    setMoreOpen(false);

    if (location.pathname !== item.path) {
      navigate(item.path);
    }
  };

  /* =======================================================
     CLOSE MORE
  ======================================================= */

  const handleCloseMore = () => {
    setMoreOpen(false);
  };

  /* =======================================================
     DRAG
  ======================================================= */

  const handleSheetDragEnd = (_event, info) => {
    const draggedEnough = info.offset.y > 90;

    const fastSwipe = info.velocity.y > 650;

    if (draggedEnough || fastSwipe) {
      handleCloseMore();
    }
  };

  /* =======================================================
     BODY LOCK
  ======================================================= */

  useEffect(() => {
    if (!moreOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [moreOpen]);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!moreOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleCloseMore();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [moreOpen]);

  return (
    <>
      {/* ===================================================
          BOTTOM BLUR
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-x-0
          bottom-0
          z-[70]
          h-[135px]
          bg-gradient-to-t
          from-[#f7f7f8]
          via-[#f7f7f8]/80
          to-transparent
          backdrop-blur-[10px]
          [-webkit-mask-image:linear-gradient(to_top,black_50%,rgba(0,0,0,0.85)_70%,transparent_100%)]
          [mask-image:linear-gradient(to_top,black_50%,rgba(0,0,0,0.85)_70%,transparent_100%)]
          lg:hidden
        "
      />

      {/* ===================================================
          DOCK
      =================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(env(safe-area-inset-bottom),10px)] lg:hidden">
        <div className="mx-auto max-w-[520px]">
          <div className="relative pt-[30px]">
            <nav
              aria-label="Mobile navigation"
              className="relative h-[66px] overflow-visible rounded-[24px] border border-white/[0.08] bg-[#090909] shadow-[0_14px_40px_rgba(0,0,0,0.30)]"
            >
              {/* ACTIVE */}

              <motion.div
                initial={false}
                animate={{
                  left: activeLeft,
                }}
                transition={NAV_SPRING}
                className="pointer-events-none absolute top-[-27px] z-30 -translate-x-1/2"
              >
                <motion.div
                  key={selectedDockId}
                  initial={{
                    scale: 0.88,
                    y: 4,
                    opacity: 0.8,
                  }}
                  animate={{
                    scale: 1,
                    y: 0,
                    opacity: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 28,
                  }}
                  className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[4px] border-white bg-black text-white ring-[3px] ring-[#f7f7f8] shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                >
                  {(() => {
                    const ActiveIcon =
                      dockItems[activeIndex]?.icon ?? MoreHorizontal;

                    return <ActiveIcon size={20} strokeWidth={2} />;
                  })()}
                </motion.div>
              </motion.div>

              {/* ITEMS */}

              <div className="grid h-full grid-cols-5">
                {dockItems.map((item, index) => {
                  const Icon = item.icon;

                  const active = activeIndex === index;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleDockNavigate(item)}
                      aria-label={item.label}
                      title={item.label}
                      className="group flex h-full items-center justify-center outline-none [-webkit-tap-highlight-color:transparent]"
                    >
                      <motion.span
                        initial={false}
                        animate={{
                          opacity: active ? 0 : 1,

                          scale: active ? 0.82 : 1,

                          y: active ? -5 : 0,
                        }}
                        whileTap={{
                          scale: 0.82,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/35 transition-colors group-hover:bg-white/[0.06] group-hover:text-white"
                      >
                        <Icon size={18} strokeWidth={1.6} />
                      </motion.span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* ===================================================
          MORE
      =================================================== */}

      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            {/* BACKDROP */}

            <motion.button
              type="button"
              aria-label="Close More menu"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.18,
              }}
              onClick={handleCloseMore}
              className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[4px]"
            />

            {/* SHEET */}

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="More navigation"
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={SHEET_SPRING}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{
                top: 0,
                bottom: 0,
              }}
              dragElastic={{
                top: 0,
                bottom: 0.45,
              }}
              dragMomentum={false}
              onDragEnd={handleSheetDragEnd}
              className="absolute inset-x-0 bottom-0 h-[88dvh] max-h-[760px] overflow-hidden rounded-t-[28px] border-t border-white/[0.08] bg-[#090909] text-white shadow-[0_-24px_70px_rgba(0,0,0,0.35)]"
            >
              {/* HANDLE */}

              <div
                role="button"
                tabIndex={0}
                aria-label="Swipe down to close More menu"
                onPointerDown={(event) => {
                  dragControls.start(event);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();

                    handleCloseMore();
                  }
                }}
                style={{
                  touchAction: "none",
                }}
                className="flex h-9 cursor-grab items-center justify-center active:cursor-grabbing"
              >
                <motion.div
                  whileTap={{
                    scaleX: 1.15,
                  }}
                  className="h-1 w-10 rounded-full bg-white/20"
                />
              </div>

              {/* CONTENT */}

              <div className="h-[calc(100%-36px)] overflow-y-auto overscroll-contain px-4 pb-[max(env(safe-area-inset-bottom),24px)]">
                {moreSections.map((section, sectionIndex) => (
                  <section
                    key={section.id}
                    className={`
                        py-5

                        ${
                          sectionIndex > 0 ? "border-t border-white/[0.07]" : ""
                        }
                      `}
                  >
                    <div className="mb-4">
                      <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-white">
                        {section.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                      {section.items.map((item) => (
                        <MoreGridItem
                          key={item.id}
                          item={item}
                          active={isActivePath(item)}
                          onClick={() => handleMoreNavigate(item)}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                <div className="h-5" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================================================
   WRAPPER
========================================================= */

function MobileNavigation({ loading = false }) {
  if (loading) {
    return <MobileNavigationSkeleton />;
  }

  return <MobileNavigationContent />;
}

export default MobileNavigation;
