import { useMemo, useState } from "react";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { useAuth } from "../auth/AuthContext";

import iconWhite from "../assets/logos/datong_icon_white.webp";
import textLogoWhite from "../assets/logos/datong_text_logo_white.webp";

import {
  sidebarAccountActions,
  sidebarNavigation,
} from "../data/sidebarNavigation";

/* =========================================================
   MEMBER RESTRICTED ITEMS

   Firebase Members cannot access:
   - Card Catalog
   - Users
   - Members
========================================================= */

const MEMBER_RESTRICTED_IDS = new Set(["card-catalog", "users", "members"]);

/* =========================================================
   TOOLTIP
========================================================= */

function SidebarTooltip({ label, visible, danger = false }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            opacity: 0,
            x: -6,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            x: -4,
            scale: 0.97,
          }}
          transition={{
            duration: 0.12,
            ease: "easeOut",
          }}
          className={`
            pointer-events-none
            absolute
            left-[calc(100%+12px)]
            top-1/2
            z-[200]
            hidden
            -translate-y-1/2
            whitespace-nowrap
            rounded-lg
            border
            px-3
            py-2
            text-[11px]
            font-medium
            tracking-[0.01em]
            shadow-[0_8px_30px_rgba(0,0,0,0.18)]
            lg:block

            ${
              danger
                ? "border-red-400/10 bg-[#171111] text-red-300"
                : "border-white/10 bg-[#171717] text-white"
            }
          `}
        >
          <span
            className={`
              absolute
              -left-1
              top-1/2
              h-2
              w-2
              -translate-y-1/2
              rotate-45
              border-b
              border-l

              ${
                danger
                  ? "border-red-400/10 bg-[#171111]"
                  : "border-white/10 bg-[#171717]"
              }
            `}
          />

          <span className="relative z-10">{label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({ item, active, collapsed, onClick }) {
  const [hovered, setHovered] = useState(false);

  const Icon = item.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={item.label}
        className={`
          group
          relative
          flex
          h-[38px]
          w-full
          items-center
          rounded-lg
          text-left
          text-[12px]
          transition-all
          duration-150

          ${collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"}

          ${
            active
              ? "bg-white/[0.09] font-medium text-white"
              : "font-normal text-white/50 hover:bg-white/[0.055] hover:text-white"
          }
        `}
      >
        <motion.span
          initial={false}
          animate={{
            opacity: active ? 1 : 0,
            height: active ? 16 : 8,
          }}
          transition={{
            duration: 0.15,
          }}
          className="
            absolute
            left-0
            top-1/2
            w-[2px]
            -translate-y-1/2
            rounded-full
            bg-white
          "
        />

        <Icon
          size={15}
          strokeWidth={1.55}
          className={`
            shrink-0
            transition-colors
            duration-150

            ${active ? "text-white" : "text-white/35 group-hover:text-white/75"}
          `}
        />

        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>

      <SidebarTooltip label={item.label} visible={collapsed && hovered} />
    </div>
  );
}

/* =========================================================
   ACCOUNT ITEM
========================================================= */

function AccountItem({ item, active, collapsed, onClick }) {
  const [hovered, setHovered] = useState(false);

  const Icon = item.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={item.label}
        className={`
          group
          relative
          flex
          h-[38px]
          w-full
          items-center
          rounded-lg
          text-left
          text-[12px]
          transition-all
          duration-150

          ${collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"}

          ${
            item.danger
              ? "text-white/50 hover:bg-red-500/[0.08] hover:text-red-400"
              : active
                ? "bg-white/[0.09] font-medium text-white"
                : "text-white/50 hover:bg-white/[0.055] hover:text-white"
          }
        `}
      >
        {!item.danger && (
          <motion.span
            initial={false}
            animate={{
              opacity: active ? 1 : 0,

              height: active ? 16 : 8,
            }}
            transition={{
              duration: 0.15,
            }}
            className="
              absolute
              left-0
              top-1/2
              w-[2px]
              -translate-y-1/2
              rounded-full
              bg-white
            "
          />
        )}

        <Icon
          size={15}
          strokeWidth={1.55}
          className={`
            shrink-0
            transition-colors
            duration-150

            ${
              item.danger
                ? "text-white/35 group-hover:text-red-400"
                : active
                  ? "text-white"
                  : "text-white/35 group-hover:text-white/75"
            }
          `}
        />

        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>

      <SidebarTooltip
        label={item.label}
        danger={item.danger}
        visible={collapsed && hovered}
      />
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  onLogout,
  currentPage = "dashboard",
}) {
  const { user, isMember } = useAuth();

  const [toggleHovered, setToggleHovered] = useState(false);

  /* =======================================================
     MEMBER ACCOUNT
  ======================================================= */

  const memberAccount =
    isMember === true || String(user?.role || "").toLowerCase() === "member";

  /* =======================================================
     VISIBLE NAVIGATION

     Members:
     Hide Card Catalog + Users + Members.

     Internal users:
     Show everything.
  ======================================================= */

  const visibleNavigation = useMemo(
    () =>
      sidebarNavigation
        .map((group) => ({
          ...group,

          items: group.items.filter(
            (item) => !memberAccount || !MEMBER_RESTRICTED_IDS.has(item.id),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [memberAccount],
  );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (item) => {
    if (memberAccount && MEMBER_RESTRICTED_IDS.has(item?.id)) {
      return;
    }

    onNavigate?.(item);
  };

  /* =======================================================
     ACCOUNT
  ======================================================= */

  const handleAccountAction = (item) => {
    if (item.id === "logout") {
      onLogout?.();

      return;
    }

    onNavigate?.(item);
  };

  return (
    <aside
      className={`
        fixed
        inset-y-0
        left-0
        z-50
        hidden
        flex-col
        overflow-visible
        bg-[#090909]
        text-white
        transition-[width]
        duration-300
        ease-out
        lg:flex

        ${collapsed ? "w-[84px]" : "w-[220px]"}
      `}
    >
      {/* ===================================================
          BRAND
      =================================================== */}

      <div
        className={`
          relative
          flex
          h-[72px]
          shrink-0
          items-center
          border-b
          border-white/[0.06]

          ${collapsed ? "justify-center px-2.5" : "px-4"}
        `}
      >
        <div
          className={`
            flex
            min-w-0
            items-center

            ${collapsed ? "justify-center" : "gap-2"}
          `}
        >
          <img
            src={iconWhite}
            alt="Datong"
            className={`
              shrink-0
              object-contain
              transition-all
              duration-300

              ${collapsed ? "h-[44px] w-[44px]" : "h-[46px] w-[46px]"}
            `}
          />

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.img
                initial={{
                  opacity: 0,
                  x: -5,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -5,
                }}
                transition={{
                  duration: 0.16,
                }}
                src={textLogoWhite}
                alt="Datong"
                className="h-[36px] w-auto max-w-[145px] shrink-0 object-contain"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===================================================
          COLLAPSE
      =================================================== */}

      <div
        className="absolute -right-[14px] top-[36px] z-[150] -translate-y-1/2"
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
        >
          {collapsed ? (
            <PanelLeftOpen size={13} strokeWidth={1.7} />
          ) : (
            <PanelLeftClose size={13} strokeWidth={1.7} />
          )}
        </button>

        <SidebarTooltip
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          visible={toggleHovered}
        />
      </div>

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <div className="min-h-0 flex-1 overflow-visible px-3 py-5">
        <nav className="space-y-5">
          {visibleNavigation.map((group) => (
            <div key={group.id}>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
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
                      duration: 0.14,
                    }}
                    className="mb-2 px-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25"
                  >
                    {group.title}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    active={currentPage === item.id}
                    collapsed={collapsed}
                    onClick={() => handleNavigation(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* ===================================================
          ACCOUNT
      =================================================== */}

      <div className="shrink-0 overflow-visible border-t border-white/[0.06] px-3 py-4">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
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
                duration: 0.14,
              }}
              className="mb-2 px-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25"
            >
              Account
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          {sidebarAccountActions.map((item) => (
            <AccountItem
              key={item.id}
              item={item}
              active={currentPage === item.id}
              collapsed={collapsed}
              onClick={() => handleAccountAction(item)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
