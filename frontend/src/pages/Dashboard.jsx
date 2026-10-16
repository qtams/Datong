import {
  ArrowDownLeft,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Landmark,
  LoaderCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  Wallet,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

import PageHeader from "../components/PageHeader";
import { DashboardSkeleton } from "../components/SkeletonLoader";

import {
  getFinanceSummary,
  getMemberCards,
  getMemberTransfers,
} from "../services/memberFinanceApi";

import datongWalletImage from "../assets/datong_wallet.webp";

/* =========================================================
   MONEY
========================================================= */

function formatPeso(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/* =========================================================
   DATE
========================================================= */

function formatTransactionDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   MEMBER DATA LOADING
========================================================= */

function MemberDashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* WALLET */}

      <div className="h-[230px] rounded-[24px] bg-gray-200" />

      {/* CARDS */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-24 rounded bg-gray-200" />

          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>

        <div className="flex gap-3 overflow-hidden">
          <div className="h-[170px] w-[82%] shrink-0 rounded-[20px] bg-gray-200 sm:w-[330px]" />

          <div className="h-[170px] w-[82%] shrink-0 rounded-[20px] bg-gray-200 sm:w-[330px]" />
        </div>
      </div>

      {/* TRANSACTIONS */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
        </div>

        <div className="space-y-0">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 border-b border-gray-100 p-4 last:border-0"
            >
              <div className="h-10 w-10 rounded-xl bg-gray-200" />

              <div className="flex-1">
                <div className="h-3 w-32 rounded bg-gray-200" />
                <div className="mt-2 h-2.5 w-20 rounded bg-gray-100" />
              </div>

              <div className="h-3 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WALLET HERO
========================================================= */

function WalletHero({
  summary,
  onCards,
  onTransactions,
}) {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[24px]
        bg-black
        text-white
        shadow-[0_18px_45px_rgba(0,0,0,0.12)]
      "
    >
      {/* BACKGROUND */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-16
          -top-10
          h-[280px]
          w-[280px]
          opacity-[0.17]
        "
      >
        <img
          src={datongWalletImage}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-white/[0.08]
          via-transparent
          to-white/[0.03]
        "
      />

      {/* CONTENT */}

      <div className="relative z-10 p-5 sm:p-6">
        {/* TOP */}

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                "
              >
                <Wallet
                  size={15}
                  strokeWidth={1.7}
                />
              </div>

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-white/50
                "
              >
                Datong Wallet
              </span>
            </div>
          </div>

          <span
            className="
              rounded-full
              border
              border-white/10
              bg-white/[0.08]
              px-2.5
              py-1
              text-[9px]
              font-medium
              text-white/65
            "
          >
            PHP
          </span>
        </div>

        {/* BALANCE */}

        <div className="mt-8">
          <p className="text-[10px] font-medium text-white/45">
            Available wallet balance
          </p>

          <h1
            className="
              mt-1.5
              text-[30px]
              font-semibold
              leading-none
              tracking-[-0.045em]
              sm:text-[36px]
            "
          >
            {formatPeso(
              summary?.actual_money,
            )}
          </h1>
        </div>

        {/* TOTALS */}

        <div
          className="
            mt-7
            grid
            grid-cols-2
            divide-x
            divide-white/10
            rounded-2xl
            border
            border-white/10
            bg-white/[0.06]
            backdrop-blur-sm
          "
        >
          <div className="p-3.5">
            <p className="text-[9px] text-white/40">
              Savings
            </p>

            <p className="mt-1 text-[12px] font-semibold text-white">
              {formatPeso(
                summary?.savings,
              )}
            </p>
          </div>

          <div className="p-3.5">
            <p className="text-[9px] text-white/40">
              Total money
            </p>

            <p className="mt-1 text-[12px] font-semibold text-white">
              {formatPeso(
                summary?.total_money,
              )}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCards}
            className="
              flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white
              px-4
              text-[10px]
              font-semibold
              text-black
              transition
              active:scale-[0.98]
            "
          >
            <CreditCard
              size={14}
              strokeWidth={1.7}
            />

            My cards
          </button>

          <button
            type="button"
            onClick={onTransactions}
            className="
              flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/[0.08]
              px-4
              text-[10px]
              font-semibold
              text-white
              transition
              active:scale-[0.98]
            "
          >
            <ArrowRightLeft
              size={14}
              strokeWidth={1.7}
            />

            Transactions
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MEMBER CARD
========================================================= */

function MemberCard({
  card,
  onClick,
}) {
  const provider =
    card?.provider || {};

  const image =
    provider?.landscape_image_url ||
    provider?.portrait_image_url ||
    "";

  const cardName =
    card?.name ||
    provider?.name ||
    "Savings";

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative
        h-[175px]
        w-[84vw]
        max-w-[340px]
        shrink-0
        snap-start
        overflow-hidden
        rounded-[20px]
        border
        border-gray-200
        bg-[#151515]
        text-left
        shadow-sm
        transition
        active:scale-[0.985]
        sm:w-[330px]
      "
    >
      {/* IMAGE */}

      {image ? (
        <img
          src={image}
          alt={provider?.name || cardName}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-800 to-black" />
      )}

      {/* OVERLAY */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/80
          via-black/20
          to-black/5
        "
      />

      {/* CONTENT */}

      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span
            className="
              rounded-full
              border
              border-white/15
              bg-black/20
              px-2.5
              py-1
              text-[9px]
              font-medium
              text-white
              backdrop-blur-md
            "
          >
            {provider?.name || "Savings"}
          </span>

          <ChevronRight
            size={17}
            className="text-white/70"
          />
        </div>

        <div>
          <p className="truncate text-[10px] font-medium text-white/65">
            {cardName}
          </p>

          <p className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-white">
            {formatPeso(card?.balance)}
          </p>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   CARDS SECTION
========================================================= */

function CardsSection({
  cards,
  onViewAll,
}) {
  return (
    <section>
      {/* HEADER */}

      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
            My cards
          </h2>

          <p className="mt-0.5 text-[10px] text-gray-400">
            {cards.length > 0
              ? `${cards.length} savings ${
                  cards.length === 1
                    ? "account"
                    : "accounts"
                }`
              : "Your savings accounts"}
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
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

      {/* CARDS */}

      {cards.length > 0 ? (
        <div
          className="
            -mx-4
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            px-4
            pb-2
            sm:mx-0
            sm:px-0
          "
        >
          {cards.map((card) => (
            <MemberCard
              key={card.id}
              card={card}
              onClick={onViewAll}
            />
          ))}

          {/* ADD CARD */}

          <button
            type="button"
            onClick={onViewAll}
            className="
              flex
              h-[175px]
              w-[145px]
              shrink-0
              snap-start
              flex-col
              items-center
              justify-center
              rounded-[20px]
              border
              border-dashed
              border-gray-300
              bg-white
              text-gray-400
              transition
              hover:border-gray-400
              hover:text-gray-800
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-gray-100
              "
            >
              <Plus
                size={17}
                strokeWidth={1.7}
              />
            </div>

            <span className="mt-2 text-[10px] font-medium">
              Add card
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onViewAll}
          className="
            flex
            w-full
            items-center
            gap-4
            rounded-2xl
            border
            border-dashed
            border-gray-300
            bg-white
            p-4
            text-left
            transition
            hover:border-gray-400
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-gray-600
            "
          >
            <CreditCard
              size={18}
              strokeWidth={1.6}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-gray-900">
              Add your first card
            </p>

            <p className="mt-1 text-[9px] leading-4 text-gray-400">
              Add a bank or e-wallet to start tracking your savings.
            </p>
          </div>

          <ChevronRight
            size={16}
            className="shrink-0 text-gray-300"
          />
        </button>
      )}
    </section>
  );
}

/* =========================================================
   TRANSACTION ITEM
========================================================= */

function TransactionItem({
  transaction,
}) {
  const from =
    transaction?.from_name ||
    (transaction?.from_type === "cash"
      ? "Datong Wallet"
      : "Account");

  const to =
    transaction?.to_name ||
    (transaction?.to_type === "cash"
      ? "Datong Wallet"
      : "Account");

  return (
    <div
      className="
        flex
        items-center
        gap-3
        border-b
        border-gray-100
        px-4
        py-3.5
        last:border-0
        sm:px-5
      "
    >
      {/* ICON */}

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-gray-100
          text-gray-700
        "
      >
        <ArrowRightLeft
          size={16}
          strokeWidth={1.6}
        />
      </div>

      {/* INFO */}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate text-[10px] font-medium text-gray-800">
            {from}
          </span>

          <ArrowRight
            size={10}
            className="shrink-0 text-gray-300"
          />

          <span className="truncate text-[10px] font-medium text-gray-800">
            {to}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-[9px] text-gray-400">
            {formatTransactionDate(
              transaction?.created_at,
            )}
          </span>

          {transaction?.note && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-gray-300" />

              <span className="max-w-[130px] truncate text-[9px] text-gray-400">
                {transaction.note}
              </span>
            </>
          )}
        </div>
      </div>

      {/* AMOUNT */}

      <p className="shrink-0 text-[11px] font-semibold text-gray-950">
        {formatPeso(
          transaction?.amount,
        )}
      </p>
    </div>
  );
}

/* =========================================================
   TRANSACTIONS
========================================================= */

function TransactionsSection({
  transactions,
  onViewAll,
}) {
  const recent =
    transactions.slice(0, 5);

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-[0_1px_2px_rgba(0,0,0,0.02)]
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-gray-100
          px-4
          py-4
          sm:px-5
        "
      >
        <div>
          <h2 className="text-[13px] font-semibold text-gray-950">
            Recent transactions
          </h2>

          <p className="mt-0.5 text-[9px] text-gray-400">
            Your latest money movements
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
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

      {/* LIST */}

      {recent.length > 0 ? (
        <div>
          {recent.map(
            (transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={
                  transaction
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-gray-400
            "
          >
            <ReceiptText
              size={18}
              strokeWidth={1.6}
            />
          </div>

          <p className="mt-3 text-[11px] font-semibold text-gray-800">
            No transactions yet
          </p>

          <p className="mx-auto mt-1 max-w-[230px] text-[9px] leading-4 text-gray-400">
            Transfers between your wallet and savings cards will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   MEMBER DASHBOARD
========================================================= */

function MemberDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState({
      savings: "0.00",
      actual_money: "0.00",
      total_money: "0.00",
      currency: "PHP",
    });

  const [cards, setCards] =
    useState([]);

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    dataLoading,
    setDataLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadDashboard =
    useCallback(async () => {
      try {
        setDataLoading(true);
        setLoadError("");

        const [
          summaryData,
          cardsData,
          transactionsData,
        ] = await Promise.all([
          getFinanceSummary(),
          getMemberCards(),
          getMemberTransfers(),
        ]);

        setSummary(
          summaryData || {
            savings: "0.00",
            actual_money: "0.00",
            total_money: "0.00",
            currency: "PHP",
          },
        );

        setCards(
          Array.isArray(cardsData)
            ? cardsData
            : [],
        );

        setTransactions(
          Array.isArray(
            transactionsData,
          )
            ? transactionsData
            : [],
        );
      } catch (error) {
        console.error(
          "Unable to load dashboard:",
          error,
        );

        setLoadError(
          error?.message ||
            "Unable to load your financial information.",
        );
      } finally {
        setDataLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     MOBILE BALANCE INFO
  ======================================================= */

  const cardCountText =
    useMemo(() => {
      if (cards.length === 1) {
        return "1 card";
      }

      return `${cards.length} cards`;
    }, [cards.length]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (dataLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="hidden lg:block">
          <PageHeader
            breadcrumbs={[
              {
                label: "Home",
                href: "#",
              },
              {
                label:
                  "Dashboard",
              },
            ]}
            title="My finances"
            description="Your wallet, cards and latest transactions."
          />
        </div>

        <MemberDashboardLoading />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (loadError) {
    return (
      <div
        className="
          mx-auto
          flex
          min-h-[55vh]
          w-full
          max-w-[500px]
          items-center
          justify-center
        "
      >
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-gray-500
            "
          >
            <RefreshCw
              size={18}
              strokeWidth={1.6}
            />
          </div>

          <h2 className="mt-4 text-[13px] font-semibold text-gray-900">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-[10px] leading-5 text-gray-400">
            {loadError}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="
              mt-5
              inline-flex
              h-9
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-black
              px-4
              text-[10px]
              font-medium
              text-white
            "
          >
            <RefreshCw
              size={13}
              strokeWidth={1.7}
            />

            Try again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MEMBER DASHBOARD
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* ===================================================
          DESKTOP HEADER

          Mobile doesn't need another large page title.
          Wallet becomes the first visual focus.
      =================================================== */}

      <div className="hidden lg:block">
        <PageHeader
          breadcrumbs={[
            {
              label: "Home",
              href: "#",
            },
            {
              label:
                "Dashboard",
            },
          ]}
          title="My finances"
          description="Your wallet, savings cards and latest money movements."
        />
      </div>

      {/* ===================================================
          MOBILE INTRO
      =================================================== */}

      <div className="mb-4 lg:hidden">
        <p className="text-[10px] font-medium text-gray-400">
          Financial overview
        </p>

        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-gray-950">
            My money
          </h1>

          <span className="text-[9px] font-medium text-gray-400">
            {cardCountText}
          </span>
        </div>
      </div>

      {/* ===================================================
          ORDER

          MOBILE:
          1. Wallet
          2. Cards
          3. Transactions

          DESKTOP:
          Wallet + Cards
          Transactions below
      =================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          lg:grid-cols-[minmax(330px,0.85fr)_minmax(0,1.4fr)]
          lg:items-start
        "
      >
        {/* 1. WALLET */}

        <WalletHero
          summary={summary}
          onCards={() =>
            navigate("/cards")
          }
          onTransactions={() =>
            navigate(
              "/transactions",
            )
          }
        />

        {/* 2. CARDS */}

        <CardsSection
          cards={cards}
          onViewAll={() =>
            navigate("/cards")
          }
        />
      </div>

      {/* 3. TRANSACTIONS */}

      <div className="mt-5">
        <TransactionsSection
          transactions={
            transactions
          }
          onViewAll={() =>
            navigate(
              "/transactions",
            )
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   INTERNAL DASHBOARD DATA

   This keeps the dashboard usable for Admin / Staff accounts.

   Firebase member finance APIs are NOT called for internal users.
========================================================= */

const internalSummary = [
  {
    title: "Total balance",
    value: "₱284,560.00",
    description:
      "Current financial position",
    icon: Wallet,
    primary: true,
  },
  {
    title: "Income",
    value: "₱124,800.00",
    description: "This month",
    icon: ArrowDownLeft,
  },
  {
    title: "Expenses",
    value: "₱68,240.00",
    description: "This month",
    icon: ArrowUpRight,
  },
  {
    title: "Savings",
    value: "₱56,560.00",
    description: "Current savings",
    icon: Landmark,
  },
];

/* =========================================================
   INTERNAL DASHBOARD
========================================================= */

function InternalDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <PageHeader
        breadcrumbs={[
          {
            label: "Home",
            href: "#",
          },
          {
            label:
              "Dashboard",
          },
        ]}
        title="Financial dashboard"
        description="A quick overview of your financial activity."
      />

      <section
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {internalSummary.map(
          ({
            title,
            value,
            description,
            icon: Icon,
            primary,
          }) => (
            <article
              key={title}
              className={`
                rounded-2xl
                border
                p-5

                ${
                  primary
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-950"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`
                      text-[10px]
                      font-medium

                      ${
                        primary
                          ? "text-white/50"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {title}
                  </p>

                  <p className="mt-2 text-[22px] font-semibold tracking-[-0.035em]">
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
                    rounded-xl

                    ${
                      primary
                        ? "bg-white/10 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.6}
                  />
                </div>
              </div>

              <p
                className={`
                  mt-5
                  text-[9px]

                  ${
                    primary
                      ? "text-white/40"
                      : "text-gray-400"
                  }
                `}
              >
                {description}
              </p>
            </article>
          ),
        )}
      </section>

      <section
        className="
          mt-4
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-5
        "
      >
        <div
          className="
            flex
            min-h-[260px]
            items-center
            justify-center
          "
        >
          <div className="max-w-[300px] text-center">
            <div
              className="
                mx-auto
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-gray-100
                text-gray-500
              "
            >
              <ReceiptText
                size={18}
                strokeWidth={1.6}
              />
            </div>

            <h2 className="mt-3 text-[12px] font-semibold text-gray-900">
              Workspace overview
            </h2>

            <p className="mt-1 text-[10px] leading-5 text-gray-400">
              Member financial information is available through individual member accounts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  loading = false,
}) {
  const { isMember } =
    useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (isMember) {
    return <MemberDashboard />;
  }

  return <InternalDashboard />;
}

export default Dashboard;