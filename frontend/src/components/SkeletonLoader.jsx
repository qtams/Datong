/* =========================================================
   BASE SKELETON
========================================================= */

function Skeleton({ className = "", dark = false, style }) {
  return (
    <div
      style={style}
      aria-hidden="true"
      className={`
        animate-pulse
        rounded-md
        ${dark ? "bg-white/[0.09]" : "bg-gray-200"}
        ${className}
      `}
    />
  );
}

/* =========================================================
   HEADER SKELETON
========================================================= */

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-5 lg:px-6">
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="flex min-w-0 items-center gap-3">
          {/* MOBILE LOGO */}

          <Skeleton className="h-9 w-9 shrink-0 rounded-lg lg:hidden" />

          {/* MOBILE GREETING */}

          <div className="min-w-0 lg:hidden">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-[72px]" />

              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-2 h-2 w-[68px]" />
          </div>

          {/* DESKTOP PAGE INFO */}

          <div className="hidden min-w-0 lg:block">
            <Skeleton className="h-3.5 w-24" />

            <Skeleton className="mt-2 h-2 w-28" />
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="flex items-center gap-1.5">
          {/* SEARCH */}

          <Skeleton className="mr-2 hidden h-9 w-[230px] rounded-lg md:block" />

          {/* NOTIFICATION */}

          <Skeleton className="h-9 w-9 rounded-lg" />

          {/* DIVIDER */}

          <div className="mx-2 hidden h-6 w-px bg-gray-200 sm:block" />

          {/* PROFILE */}

          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

            <div className="hidden min-w-[72px] sm:block">
              <Skeleton className="h-2.5 w-14" />

              <Skeleton className="mt-2 h-2 w-[68px]" />
            </div>

            <Skeleton className="hidden h-3 w-3 rounded-sm sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   SIDEBAR SKELETON
========================================================= */

export function SidebarSkeleton({ collapsed = false }) {
  return (
    <aside
      className={`
        fixed
        inset-y-0
        left-0
        z-50
        hidden
        flex-col
        overflow-hidden
        bg-[#090909]
        text-white
        transition-[width]
        duration-300
        ease-out
        lg:flex

        ${collapsed ? "w-[84px]" : "w-[220px]"}
      `}
    >
      {/* =================================================
          BRAND
      ================================================= */}

      <div
        className={`
          flex
          h-[72px]
          shrink-0
          items-center
          border-b
          border-white/[0.06]

          ${collapsed ? "justify-center px-2.5" : "gap-3 px-4"}
        `}
      >
        <Skeleton
          dark
          className={`
            shrink-0
            rounded-xl

            ${collapsed ? "h-[42px] w-[42px]" : "h-[44px] w-[44px]"}
          `}
        />

        {!collapsed && <Skeleton dark className="h-5 w-20" />}
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="min-h-0 flex-1 px-3 py-5">
        <div className="space-y-5">
          <SidebarSkeletonGroup collapsed={collapsed} items={1} />

          <SidebarSkeletonGroup collapsed={collapsed} items={4} />

          <SidebarSkeletonGroup collapsed={collapsed} items={2} />

          <SidebarSkeletonGroup collapsed={collapsed} items={1} />
        </div>
      </div>

      {/* =================================================
          ACCOUNT
      ================================================= */}

      <div className="shrink-0 border-t border-white/[0.06] px-3 py-4">
        {!collapsed && <Skeleton dark className="mb-3 ml-2 h-2 w-12" />}

        <div className="space-y-1">
          {[1, 2].map((item) => (
            <div
              key={item}
              className={`
                flex
                h-[38px]
                items-center
                rounded-lg

                ${collapsed ? "justify-center" : "gap-3 px-2.5"}
              `}
            >
              <Skeleton dark className="h-4 w-4 shrink-0" />

              {!collapsed && <Skeleton dark className="h-2.5 w-16" />}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   SIDEBAR GROUP SKELETON
========================================================= */

function SidebarSkeletonGroup({ collapsed, items = 2 }) {
  return (
    <div>
      {!collapsed && <Skeleton dark className="mb-3 ml-2 h-2 w-10" />}

      <div className="space-y-1">
        {Array.from({
          length: items,
        }).map((_, index) => (
          <div
            key={index}
            className={`
              flex
              h-[38px]
              items-center
              rounded-lg

              ${collapsed ? "justify-center" : "gap-3 px-2.5"}
            `}
          >
            <Skeleton dark className="h-4 w-4 shrink-0" />

            {!collapsed && (
              <Skeleton
                dark
                className={`
                  h-2.5

                  ${index % 2 === 0 ? "w-20" : "w-24"}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE NAVIGATION SKELETON

   Dashboard | Cards | More | Transactions | Savings
========================================================= */

export function MobileNavigationSkeleton() {
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
          MOBILE DOCK
      =================================================== */}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-[80]
          px-3
          pb-[max(env(safe-area-inset-bottom),10px)]
          lg:hidden
        "
      >
        <div className="mx-auto max-w-[520px]">
          <div className="relative pt-[30px]">
            <div
              className="
                relative
                h-[66px]
                overflow-visible
                rounded-[24px]
                border
                border-white/[0.08]
                bg-[#090909]
                shadow-[0_14px_40px_rgba(0,0,0,0.30)]
              "
            >
              {/* ===========================================
                  FLOATING ACTIVE CIRCLE
              =========================================== */}

              <div
                className="
                  absolute
                  left-[10%]
                  top-[-27px]
                  z-30
                  -translate-x-1/2
                "
              >
                <div
                  className="
                    flex
                    h-[58px]
                    w-[58px]
                    items-center
                    justify-center
                    rounded-full
                    border-[4px]
                    border-white
                    bg-black
                    ring-[3px]
                    ring-[#f7f7f8]
                    shadow-[0_8px_24px_rgba(0,0,0,0.28)]
                  "
                >
                  <Skeleton
                    dark
                    className="
                      h-[18px]
                      w-[18px]
                      rounded-md
                      bg-white/20
                    "
                  />
                </div>
              </div>

              {/* ===========================================
                  NAVIGATION ICONS
              =========================================== */}

              <div className="grid h-full grid-cols-5">
                {/* DASHBOARD ACTIVE */}

                <div />

                {/* CARDS */}

                <div className="flex items-center justify-center">
                  <Skeleton dark className="h-[18px] w-[18px]" />
                </div>

                {/* MORE */}

                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-[3px]">
                    {[1, 2, 3].map((item) => (
                      <Skeleton
                        key={item}
                        dark
                        className="h-[3px] w-[3px] rounded-full"
                      />
                    ))}
                  </div>
                </div>

                {/* TRANSACTIONS */}

                <div className="flex items-center justify-center">
                  <Skeleton dark className="h-[18px] w-[18px]" />
                </div>

                {/* SAVINGS */}

                <div className="flex items-center justify-center">
                  <Skeleton dark className="h-[18px] w-[18px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   DASHBOARD SUMMARY CARD
========================================================= */

function DashboardCardSkeleton({ primary = false }) {
  return (
    <article
      className={`
        rounded-xl
        border
        p-5

        ${primary ? "border-black bg-black" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <Skeleton dark={primary} className="h-2.5 w-20" />

          <Skeleton dark={primary} className="mt-3 h-6 w-32" />
        </div>

        <Skeleton dark={primary} className="h-9 w-9 rounded-lg" />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Skeleton dark={primary} className="h-2.5 w-10" />

        <Skeleton dark={primary} className="h-2.5 w-16" />
      </div>
    </article>
  );
}

/* =========================================================
   DASHBOARD SKELETON
========================================================= */

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Skeleton className="h-2.5 w-16" />

          <Skeleton className="mt-3 h-6 w-52" />

          <Skeleton className="mt-3 h-3 w-[340px] max-w-full" />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Skeleton className="h-9 w-24 rounded-lg" />

          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCardSkeleton primary />

        <DashboardCardSkeleton />

        <DashboardCardSkeleton />

        <DashboardCardSkeleton />
      </section>

      {/* =================================================
          MIDDLE
      ================================================= */}

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        {/* CASH FLOW */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <Skeleton className="h-3 w-20" />

              <Skeleton className="mt-2 h-2.5 w-52" />
            </div>

            <Skeleton className="h-8 w-24 rounded-md" />
          </div>

          <div className="p-5">
            {/* LEGEND */}

            <div className="mb-6 flex gap-5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-sm" />

                <Skeleton className="h-2 w-12" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-sm" />

                <Skeleton className="h-2 w-14" />
              </div>
            </div>

            {/* CHART */}

            <div className="flex h-[240px] items-end justify-between gap-4 px-2">
              {[
                {
                  first: 58,
                  second: 36,
                },
                {
                  first: 72,
                  second: 49,
                },
                {
                  first: 65,
                  second: 41,
                },
                {
                  first: 84,
                  second: 52,
                },
                {
                  first: 77,
                  second: 46,
                },
                {
                  first: 93,
                  second: 56,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div className="flex flex-1 items-end justify-center gap-1.5">
                    <Skeleton
                      className="w-full max-w-[22px] rounded-t-md"
                      style={{
                        height: `${item.first}%`,
                      }}
                    />

                    <Skeleton
                      className="w-full max-w-[22px] rounded-t-md"
                      style={{
                        height: `${item.second}%`,
                      }}
                    />
                  </div>

                  <Skeleton className="mx-auto mt-3 h-2 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BUDGET */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <Skeleton className="h-3 w-28" />

              <Skeleton className="mt-2 h-2.5 w-36" />
            </div>

            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          <div className="space-y-6 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item}>
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <Skeleton className="h-2.5 w-20" />

                    <Skeleton className="mt-2 h-2 w-24" />
                  </div>

                  <Skeleton className="h-2.5 w-8" />
                </div>

                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          LOWER
      ================================================= */}

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        {/* TRANSACTIONS */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <Skeleton className="h-3 w-32" />

              <Skeleton className="mt-2 h-2.5 w-36" />
            </div>

            <Skeleton className="h-2.5 w-12" />
          </div>

          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />

                  <div>
                    <Skeleton className="h-2.5 w-32" />

                    <Skeleton className="mt-2 h-2 w-16" />
                  </div>
                </div>

                <Skeleton className="h-2.5 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <Skeleton className="h-3 w-24" />

            <Skeleton className="mt-2 h-2.5 w-32" />
          </div>

          <div className="grid grid-cols-2 gap-2 p-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="min-h-[100px] rounded-lg border border-gray-200 p-3"
              >
                <Skeleton className="h-8 w-8 rounded-lg" />

                <Skeleton className="mt-7 h-2.5 w-16" />

                <Skeleton className="mt-2 h-2 w-12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   USER STAT CARD SKELETON
========================================================= */

function UserStatSkeleton({ primary = false }) {
  return (
    <article
      className={`
        rounded-xl
        border
        p-5

        ${primary ? "border-black bg-black" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <Skeleton dark={primary} className="h-2.5 w-20" />

          <Skeleton dark={primary} className="mt-4 h-7 w-10" />
        </div>

        <Skeleton dark={primary} className="h-9 w-9 rounded-lg" />
      </div>

      <Skeleton dark={primary} className="mt-5 h-2 w-28" />
    </article>
  );
}

/* =========================================================
   USER TABLE ROW SKELETON
========================================================= */

function UserTableRowSkeleton() {
  return (
    <div
      className="
        grid
        min-h-[68px]
        grid-cols-[1.6fr_1.8fr_1fr_0.8fr_0.9fr_1.1fr_80px]
        items-center
        gap-5
        border-b
        border-gray-100
        px-5
        last:border-0
      "
    >
      {/* USER */}

      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

        <div className="min-w-0">
          <Skeleton className="h-2.5 w-28" />

          <Skeleton className="mt-2 h-2 w-16" />
        </div>
      </div>

      {/* EMAIL */}

      <div className="flex min-w-0 items-center gap-2">
        <Skeleton className="h-3 w-3 shrink-0" />

        <Skeleton className="h-2.5 w-36 max-w-full" />
      </div>

      {/* BIRTHDAY */}

      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3" />

        <Skeleton className="h-2.5 w-20" />
      </div>

      {/* ROLE */}

      <Skeleton className="h-6 w-16 rounded-md" />

      {/* CREATED */}

      <Skeleton className="h-2.5 w-20" />

      {/* LAST LOGIN */}

      <Skeleton className="h-2.5 w-28" />

      {/* ACTIONS */}

      <div className="flex justify-end gap-1">
        <Skeleton className="h-8 w-8 rounded-lg" />

        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

/* =========================================================
   USER MOBILE CARD SKELETON
========================================================= */

function UserMobileCardSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

          <div>
            <Skeleton className="h-2.5 w-28" />

            <Skeleton className="mt-2 h-2 w-36" />

            <Skeleton className="mt-2 h-2 w-14" />
          </div>
        </div>

        <Skeleton className="h-6 w-14 rounded-md" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
        <div>
          <Skeleton className="h-2 w-12" />

          <Skeleton className="mt-2 h-2.5 w-20" />
        </div>

        <div>
          <Skeleton className="h-2 w-12" />

          <Skeleton className="mt-2 h-2.5 w-20" />
        </div>

        <div className="col-span-2">
          <Skeleton className="h-2 w-14" />

          <Skeleton className="mt-2 h-2.5 w-28" />
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />

        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

/* =========================================================
   USERS SKELETON
========================================================= */

export function UsersSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6">
        {/* BREADCRUMBS */}

        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-2.5 w-10" />

          <Skeleton className="h-1.5 w-1.5 rounded-full" />

          <Skeleton className="h-2.5 w-10" />

          <Skeleton className="h-1.5 w-1.5 rounded-full" />

          <Skeleton className="h-2.5 w-12" />
        </div>

        {/* TITLE */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Skeleton className="h-6 w-24" />

            <Skeleton className="mt-3 h-3 w-[340px] max-w-full" />
          </div>

          <Skeleton className="h-9 w-[100px] rounded-lg" />
        </div>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <UserStatSkeleton primary />

        <UserStatSkeleton />

        <UserStatSkeleton />
      </section>

      {/* =================================================
          USER TABLE
      ================================================= */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full rounded-lg sm:w-[360px]" />

          <Skeleton className="h-9 w-[90px] rounded-lg" />
        </div>

        {/* ===============================================
            DESKTOP
        =============================================== */}

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[1080px]">
            {/* HEADER */}

            <div
              className="
                grid
                grid-cols-[1.6fr_1.8fr_1fr_0.8fr_0.9fr_1.1fr_80px]
                gap-5
                border-b
                border-gray-100
                bg-gray-50/60
                px-5
                py-3
              "
            >
              <Skeleton className="h-2 w-10" />

              <Skeleton className="h-2 w-10" />

              <Skeleton className="h-2 w-14" />

              <Skeleton className="h-2 w-8" />

              <Skeleton className="h-2 w-12" />

              <Skeleton className="h-2 w-14" />

              <div className="flex justify-end">
                <Skeleton className="h-2 w-12" />
              </div>
            </div>

            {/* ROWS */}

            {[1, 2, 3, 4, 5].map((row) => (
              <UserTableRowSkeleton key={row} />
            ))}
          </div>
        </div>

        {/* ===============================================
            MOBILE
        =============================================== */}

        <div className="divide-y divide-gray-100 md:hidden">
          {[1, 2, 3, 4].map((row) => (
            <UserMobileCardSkeleton key={row} />
          ))}
        </div>

        {/* ===============================================
            FOOTER
        =============================================== */}

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-5 py-3">
          <Skeleton className="h-2 w-24" />

          <Skeleton className="hidden h-2 w-20 sm:block" />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   EXPORT BASE
========================================================= */

export { Skeleton };
