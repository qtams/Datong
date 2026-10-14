import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Ellipsis,
  Eye,
  Landmark,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Send,
  Wallet,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { DashboardSkeleton } from "../components/SkeletonLoader";

/* =========================================================
   SUMMARY DATA
========================================================= */

const summaryCards = [
  {
    title: "Total balance",
    value: "₱284,560.00",
    change: "+12.4%",
    description: "vs. last month",
    icon: Wallet,
    primary: true,
  },

  {
    title: "Income",
    value: "₱124,800.00",
    change: "+8.2%",
    description: "this month",
    icon: ArrowDownLeft,
  },

  {
    title: "Expenses",
    value: "₱68,240.00",
    change: "-4.1%",
    description: "this month",
    icon: ArrowUpRight,
  },

  {
    title: "Savings",
    value: "₱56,560.00",
    change: "+16.8%",
    description: "this month",
    icon: Landmark,
  },
];

/* =========================================================
   TRANSACTIONS
========================================================= */

const transactions = [
  {
    id: 1,
    name: "Office supplies",
    category: "Business",
    date: "Oct 14, 2026",
    amount: "-₱4,250.00",
    type: "expense",
  },

  {
    id: 2,
    name: "Client payment",
    category: "Income",
    date: "Oct 13, 2026",
    amount: "+₱48,500.00",
    type: "income",
  },

  {
    id: 3,
    name: "Internet payment",
    category: "Utilities",
    date: "Oct 12, 2026",
    amount: "-₱2,499.00",
    type: "expense",
  },

  {
    id: 4,
    name: "Software subscription",
    category: "Software",
    date: "Oct 11, 2026",
    amount: "-₱1,850.00",
    type: "expense",
  },

  {
    id: 5,
    name: "Project deposit",
    category: "Income",
    date: "Oct 10, 2026",
    amount: "+₱32,000.00",
    type: "income",
  },
];

/* =========================================================
   BUDGET
========================================================= */

const budgets = [
  {
    label: "Business",
    spent: "₱24,500",
    total: "₱40,000",
    progress: 61,
  },

  {
    label: "Utilities",
    spent: "₱8,200",
    total: "₱15,000",
    progress: 55,
  },

  {
    label: "Software",
    spent: "₱6,400",
    total: "₱12,000",
    progress: 53,
  },

  {
    label: "Marketing",
    spent: "₱11,800",
    total: "₱25,000",
    progress: 47,
  },
];

/* =========================================================
   CASH FLOW
========================================================= */

const cashFlow = [
  {
    month: "May",
    income: 60,
    expense: 39,
  },
  {
    month: "Jun",
    income: 76,
    expense: 52,
  },
  {
    month: "Jul",
    income: 68,
    expense: 44,
  },
  {
    month: "Aug",
    income: 88,
    expense: 56,
  },
  {
    month: "Sep",
    income: 80,
    expense: 49,
  },
  {
    month: "Oct",
    income: 96,
    expense: 58,
  },
];

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  primary,
}) {
  return (
    <article
      className={`
        rounded-xl
        border
        p-5
        transition-all
        duration-200

        ${
          primary
            ? "border-black bg-black text-white"
            : "border-gray-200 bg-white text-gray-950 hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-[11px] font-medium ${
              primary ? "text-white/55" : "text-gray-500"
            }`}
          >
            {title}
          </p>

          <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em]">
            {value}
          </p>
        </div>

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg

            ${primary ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600"}
          `}
        >
          <Icon size={16} strokeWidth={1.6} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        <span
          className={`text-[10px] font-semibold ${
            primary ? "text-white" : "text-gray-900"
          }`}
        >
          {change}
        </span>

        <span
          className={`text-[10px] ${
            primary ? "text-white/40" : "text-gray-400"
          }`}
        >
          {description}
        </span>
      </div>
    </article>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ loading = false }) {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        breadcrumbs={[
          {
            label: "Home",
            href: "#",
          },
          {
            label: "Dashboard",
          },
        ]}
        title="Financial dashboard"
        description="A quick overview of your financial activity and performance."
        actions={
          <>
            <button
              type="button"
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-[11px]
                font-medium
                text-gray-700
                transition-colors
                hover:border-gray-300
                hover:bg-gray-50
              "
            >
              <Eye size={14} strokeWidth={1.6} />
              View report
            </button>

            <button
              type="button"
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-lg
                bg-black
                px-3.5
                text-[11px]
                font-medium
                text-white
                transition-colors
                hover:bg-gray-800
              "
            >
              <Plus size={14} strokeWidth={1.7} />
              Add transaction
            </button>
          </>
        }
      />

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      {/* ===================================================
          MAIN ROW
      =================================================== */}

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        {/* =================================================
            CASH FLOW
        ================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-[13px] font-semibold text-gray-950">
                Cash flow
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Income and expenses over the last 6 months
              </p>
            </div>

            <button
              type="button"
              className="
                flex
                h-8
                items-center
                rounded-md
                border
                border-gray-200
                px-2.5
                text-[10px]
                font-medium
                text-gray-500
                transition-colors
                hover:bg-gray-50
              "
            >
              Last 6 months
            </button>
          </div>

          <div className="p-5">
            {/* LEGEND */}
            <div className="mb-6 flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-black" />

                <span className="text-[10px] text-gray-500">Income</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-gray-300" />

                <span className="text-[10px] text-gray-500">Expenses</span>
              </div>
            </div>

            {/* CHART */}
            <div className="relative h-[240px]">
              {/* GRID */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1, 2, 3, 4, 5].map((line) => (
                  <div
                    key={line}
                    className="border-t border-dashed border-gray-100"
                  />
                ))}
              </div>

              {/* BARS */}
              <div className="absolute inset-0 flex items-end justify-between gap-4 px-2">
                {cashFlow.map((item) => (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="flex flex-1 items-end justify-center gap-1.5">
                      {/* INCOME */}
                      <div
                        className="
                          w-full
                          max-w-[22px]
                          rounded-t-[4px]
                          bg-black
                          transition-colors
                          hover:bg-gray-800
                        "
                        style={{
                          height: `${item.income}%`,
                        }}
                      />

                      {/* EXPENSE */}
                      <div
                        className="
                          w-full
                          max-w-[22px]
                          rounded-t-[4px]
                          bg-gray-300
                          transition-colors
                          hover:bg-gray-400
                        "
                        style={{
                          height: `${item.expense}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-center text-[9px] font-medium text-gray-400">
                      {item.month}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            BUDGET
        ================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-[13px] font-semibold text-gray-950">
                Budget overview
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Monthly spending limits
              </p>
            </div>

            <button
              type="button"
              aria-label="Budget options"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                text-gray-400
                transition-colors
                hover:bg-gray-100
                hover:text-gray-900
              "
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="space-y-5 p-5">
            {budgets.map((budget) => (
              <div key={budget.label}>
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-gray-800">
                      {budget.label}
                    </p>

                    <p className="mt-0.5 text-[9px] text-gray-400">
                      {budget.spent} of {budget.total}
                    </p>
                  </div>

                  <span className="text-[10px] font-medium text-gray-500">
                    {budget.progress}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-300"
                    style={{
                      width: `${budget.progress}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          LOWER ROW
      =================================================== */}

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        {/* =================================================
            TRANSACTIONS
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-[13px] font-semibold text-gray-950">
                Recent transactions
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Latest account activity
              </p>
            </div>

            <button
              type="button"
              className="
                flex
                items-center
                gap-1
                text-[10px]
                font-medium
                text-gray-500
                transition-colors
                hover:text-black
              "
            >
              View all
              <ChevronRight size={13} />
            </button>
          </div>

          {/* ===============================================
              DESKTOP TABLE
          =============================================== */}

          <div className="hidden md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Transaction
                  </th>

                  <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Category
                  </th>

                  <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Amount
                  </th>

                  <th className="w-10" />
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="
                        border-b
                        border-gray-100
                        transition-colors
                        last:border-0
                        hover:bg-gray-50/70
                      "
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                          {transaction.type === "income" ? (
                            <ArrowDownLeft size={14} strokeWidth={1.6} />
                          ) : (
                            <ArrowUpRight size={14} strokeWidth={1.6} />
                          )}
                        </div>

                        <p className="text-[11px] font-medium text-gray-800">
                          {transaction.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-[10px] text-gray-500">
                      {transaction.category}
                    </td>

                    <td className="px-5 py-3.5 text-[10px] text-gray-400">
                      {transaction.date}
                    </td>

                    <td
                      className={`px-5 py-3.5 text-right text-[11px] font-medium ${
                        transaction.type === "income"
                          ? "text-gray-950"
                          : "text-gray-600"
                      }`}
                    >
                      {transaction.amount}
                    </td>

                    <td className="pr-3">
                      <button
                        type="button"
                        aria-label="Transaction options"
                        className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            text-gray-300
                            transition-colors
                            hover:bg-gray-100
                            hover:text-gray-700
                          "
                      >
                        <Ellipsis size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===============================================
              MOBILE LIST
          =============================================== */}

          <div className="divide-y divide-gray-100 md:hidden">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    {transaction.type === "income" ? (
                      <ArrowDownLeft size={14} strokeWidth={1.6} />
                    ) : (
                      <ArrowUpRight size={14} strokeWidth={1.6} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-gray-800">
                      {transaction.name}
                    </p>

                    <p className="mt-0.5 text-[9px] text-gray-400">
                      {transaction.category}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-[10px] font-medium text-gray-700">
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-[13px] font-semibold text-gray-950">
              Quick actions
            </h2>

            <p className="mt-0.5 text-[10px] text-gray-400">
              Common financial tasks
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4">
            {/* TRANSFER */}
            <button
              type="button"
              className="
                group
                flex
                min-h-[100px]
                flex-col
                justify-between
                rounded-lg
                border
                border-gray-200
                p-3
                text-left
                transition-all
                duration-200
                hover:border-gray-300
                hover:bg-gray-50
              "
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Send size={14} strokeWidth={1.6} />
              </div>

              <div>
                <p className="text-[11px] font-medium text-gray-900">
                  Transfer
                </p>

                <p className="mt-0.5 text-[9px] text-gray-400">Send money</p>
              </div>
            </button>

            {/* EXPENSE */}
            <button
              type="button"
              className="
                group
                flex
                min-h-[100px]
                flex-col
                justify-between
                rounded-lg
                border
                border-gray-200
                p-3
                text-left
                transition-all
                duration-200
                hover:border-gray-300
                hover:bg-gray-50
              "
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <ReceiptText size={14} strokeWidth={1.6} />
              </div>

              <div>
                <p className="text-[11px] font-medium text-gray-900">Expense</p>

                <p className="mt-0.5 text-[9px] text-gray-400">Add expense</p>
              </div>
            </button>

            {/* PAYMENT */}
            <button
              type="button"
              className="
                group
                flex
                min-h-[100px]
                flex-col
                justify-between
                rounded-lg
                border
                border-gray-200
                p-3
                text-left
                transition-all
                duration-200
                hover:border-gray-300
                hover:bg-gray-50
              "
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <CreditCard size={14} strokeWidth={1.6} />
              </div>

              <div>
                <p className="text-[11px] font-medium text-gray-900">Payment</p>

                <p className="mt-0.5 text-[9px] text-gray-400">Pay a bill</p>
              </div>
            </button>

            {/* ACCOUNT */}
            <button
              type="button"
              className="
                group
                flex
                min-h-[100px]
                flex-col
                justify-between
                rounded-lg
                border
                border-gray-200
                p-3
                text-left
                transition-all
                duration-200
                hover:border-gray-300
                hover:bg-gray-50
              "
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <Landmark size={14} strokeWidth={1.6} />
              </div>

              <div>
                <p className="text-[11px] font-medium text-gray-900">Account</p>

                <p className="mt-0.5 text-[9px] text-gray-400">Add account</p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
