import {
  ArrowDownLeft,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Landmark,
  PiggyBank,
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
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthContext";

import PageHeader from "../components/PageHeader";
import { DashboardSkeleton } from "../components/SkeletonLoader";
import WalletBalanceModal from "../components/modals/WalletBalanceModal";

import {
  getCashAccount,
  getFinanceSummary,
  getMemberCards,
  getMemberTransfers,
  updateCashBalance,
} from "../services/memberFinanceApi";

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
    <div className="animate-pulse">
      {/* MOBILE INTRO */}

      <div className="mb-4 lg:hidden">
        <div className="h-2.5 w-24 rounded bg-gray-200" />

        <div className="mt-2 flex items-end justify-between">
          <div className="h-6 w-28 rounded bg-gray-200" />

          <div className="h-2.5 w-12 rounded bg-gray-200" />
        </div>
      </div>

      {/* WALLET */}

      <div className="h-[180px] rounded-[24px] bg-gray-200" />

      {/* QUICK ACTIONS */}

      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex h-[92px] flex-col items-center justify-center gap-2.5"
          >
            <div className="h-14 w-14 rounded-full bg-gray-200 sm:h-[60px] sm:w-[60px]" />

            <div className="h-2.5 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* CARDS */}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="h-4 w-20 rounded bg-gray-200" />

            <div className="mt-2 h-2.5 w-16 rounded bg-gray-200" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-9 w-[68px] rounded-full bg-gray-200" />

            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
        </div>

        <div className="relative mx-auto w-fit pt-[22px] lg:hidden">
          <div className="absolute left-0 top-0 z-0 aspect-[1.65/1] w-[84vw] max-w-[340px] rounded-[18px] bg-gray-300" />

          <div className="absolute left-0 top-[11px] z-[1] aspect-[1.65/1] w-[84vw] max-w-[340px] rounded-[18px] bg-gray-200" />

          <div className="relative z-10 aspect-[1.65/1] w-[84vw] max-w-[340px] shrink-0 rounded-[18px] bg-gray-100 sm:w-[330px]" />
        </div>

        <div className="hidden gap-3 overflow-hidden lg:flex">
          <div className="aspect-[1.65/1] w-[340px] shrink-0 rounded-[18px] bg-gray-200" />

          <div className="aspect-[1.65/1] w-[340px] shrink-0 rounded-[18px] bg-gray-200" />
        </div>
      </div>

      {/* TRANSACTIONS */}

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
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

function WalletHero({ summary }) {
  return (
    <section
      className="
        relative
        min-h-[180px]
        overflow-hidden
        rounded-[24px]
        bg-black
        text-white
        shadow-[0_18px_45px_rgba(0,0,0,0.12)]
      "
    >
      {/* CONTENT */}

      <div className="p-5 sm:p-6">
        {/* TOP */}

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
      </div>
    </section>
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

function QuickActions({ onNavigate, onWallet }) {
  const actions = [
    {
      label: "Add Datong wallet",
      icon: Wallet,
      onClick: onWallet,
    },
    {
      label: "Expenses",
      icon: ReceiptText,
      onClick: () => onNavigate("/transactions"),
    },
    {
      label: "Saving goals",
      icon: PiggyBank,
      onClick: () => onNavigate("/savings-goals"),
    },
  ];

  return (
    <section
      aria-label="Quick actions"
      className="grid grid-cols-3 gap-3 py-1 sm:gap-5"
    >
      {actions.map(({ label, icon: Icon, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="
            group
            flex
            min-w-0
            flex-col
            items-center
            justify-center
            gap-2.5
            bg-transparent
            px-1
            py-1.5
            text-center
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-black/30
            focus-visible:ring-offset-2
          "
        >
          <span
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-black
              text-white
              shadow-[0_8px_18px_rgba(0,0,0,0.2)]
              transition-all
              duration-200
              group-hover:-translate-y-0.5
              group-hover:bg-black
              group-hover:text-white
              group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.26)]
              group-active:translate-y-0
              group-active:scale-95
              sm:h-[60px]
              sm:w-[60px]
            "
          >
            <Icon size={22} strokeWidth={1.8} />
          </span>

          <span className="flex min-h-7 max-w-full items-center justify-center text-[11px] font-medium leading-[1.2] text-gray-900 sm:text-[12px]">
            {label}
          </span>
        </button>
      ))}
    </section>
  );
}

/* =========================================================
   DASHBOARD CARD VIEW
========================================================= */

function PortraitCardIcon({ size = 13, strokeWidth = 1.7 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6.5"
        y="2.5"
        width="11"
        height="19"
        rx="2.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M8.8 7h6.4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardViewSwitcher({ value, onChange }) {
  const modes = [
    {
      id: "landscape",
      label: "Landscape cards",
      icon: CreditCard,
    },
    {
      id: "portrait",
      label: "Portrait cards",
      icon: PortraitCardIcon,
    },
  ];

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full bg-gray-200/80 p-1"
      aria-label="Card view"
    >
      {modes.map(({ id, label, icon: Icon }) => {
        const active = value === id;

        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={`
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              transition-all
              ${
                active
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }
            `}
          >
            <Icon
              size={13}
              strokeWidth={active ? 2 : 1.6}
            />
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   MEMBER CARD
========================================================= */

function MemberCard({
  card,
  viewMode,
  onClick,
  actionLabel,
  tabIndex = 0,
}) {
  const provider =
    card?.provider || {};

  const landscapeImage =
    provider?.landscape_image_url ||
    provider?.portrait_image_url ||
    "";

  const portraitImage =
    provider?.portrait_image_url ||
    provider?.landscape_image_url ||
    "";

  const portraitMode =
    viewMode === "portrait";

  const image = portraitMode
    ? portraitImage
    : landscapeImage;

  const cardName =
    card?.name ||
    provider?.name ||
    "Savings";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        actionLabel ||
        `${cardName}, ${formatPeso(card?.balance)}`
      }
      tabIndex={tabIndex}
      className="
        group
        relative
        shrink-0
        snap-start
        bg-transparent
        text-center
        transition-transform
        hover:-translate-y-0.5
        active:scale-[0.985]
      "
      style={{
        aspectRatio: portraitMode ? "0.64 / 1" : "1.65 / 1",
        width: portraitMode
          ? "min(54vw, 205px)"
          : "min(84vw, 340px)",
      }}
    >
      {/* IMAGE */}

      <span className="flex h-full w-full items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={`${provider?.name || cardName} ${
              portraitMode ? "portrait" : "landscape"
            }`}
            className={`
              w-full
              rounded-[18px]
              ${
                portraitMode
                  ? "h-[91.5%] object-cover"
                  : "h-full object-contain"
              }
            `}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-gray-300">
            <CreditCard size={40} strokeWidth={1.25} />
          </span>
        )}
      </span>

      {/* AMOUNT */}

      <span
        className={`
          absolute
          z-10
          flex
          max-w-[72%]
          flex-col
          items-start
          text-left
          text-white
          [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]
          ${portraitMode ? "bottom-[12%] left-[10%]" : "bottom-[9%] left-[8%]"}
        `}
      >
        <span className="max-w-full truncate text-[9px] font-medium leading-none text-white/85 sm:text-[10px]">
          {cardName}
        </span>

        <span
          className={`
            mt-1
            font-bold
            leading-none
            tracking-[-0.025em]
            ${portraitMode ? "text-[13px] sm:text-[14px]" : "text-[14px] sm:text-[16px]"}
          `}
        >
          {formatPeso(card?.balance)}
        </span>
      </span>
    </button>
  );
}

/* =========================================================
   MOBILE CARD STACK
========================================================= */

function MobileCardStack({
  cards,
  viewMode,
  activeIndex,
  onAdvance,
  onViewAll,
}) {
  const portraitMode =
    viewMode === "portrait";

  const visibleCount = Math.min(
    cards.length,
    4,
  );

  const orderedCards = Array.from(
    { length: visibleCount },
    (_, depth) =>
      cards[
        (activeIndex + depth) %
          cards.length
      ],
  );

  const layerOffset = 11;

  const cardSize = {
    aspectRatio: portraitMode
      ? "0.64 / 1"
      : "1.65 / 1",
    width: portraitMode
      ? "min(54vw, 205px)"
      : "min(84vw, 340px)",
  };

  return (
    <div
      className="relative mx-auto w-fit transition-[width,height] duration-300 lg:hidden"
      style={{
        paddingTop:
          layerOffset *
          Math.max(visibleCount - 1, 0),
      }}
      role="group"
      aria-label={`${cards.length} card accounts. Click the front card to show the next card.`}
    >
      <div
        aria-hidden="true"
        className="invisible pointer-events-none"
        style={cardSize}
      />

      {orderedCards
        .slice()
        .reverse()
        .map((card, reversedIndex) => {
          const depth =
            visibleCount -
            reversedIndex -
            1;

          const front = depth === 0;

          return (
            <div
              key={card.id}
              className="absolute transition-all duration-300 ease-out"
              style={{
                left: 0,
                top:
                  layerOffset *
                  (visibleCount -
                    depth -
                    1),
                zIndex:
                  visibleCount - depth,
                filter: front
                  ? "none"
                  : `brightness(${Math.max(0.72, 0.94 - depth * 0.07)})`,
                pointerEvents: front
                  ? "auto"
                  : "none",
              }}
            >
              <MemberCard
                card={card}
                viewMode={viewMode}
                onClick={
                  cards.length > 1
                    ? onAdvance
                    : onViewAll
                }
                actionLabel={`${
                  card?.name ||
                  card?.provider?.name ||
                  "Card"
                }, ${formatPeso(
                  card?.balance,
                )}. ${
                  cards.length > 1
                    ? "Show next card"
                    : "View card"
                }`}
                tabIndex={front ? 0 : -1}
              />
            </div>
          );
        })}
    </div>
  );
}

/* =========================================================
   CARDS SECTION
========================================================= */

function CardsSection({
  cards,
  onViewAll,
}) {
  const [viewMode, setViewMode] =
    useState("landscape");

  const [activeCardIndex, setActiveCardIndex] =
    useState(0);

  const normalizedActiveIndex =
    cards.length > 0
      ? activeCardIndex % cards.length
      : 0;

  const handleAdvanceCard = () => {
    setActiveCardIndex(
      (current) =>
        cards.length > 0
          ? (current + 1) %
            cards.length
          : 0,
    );
  };

  return (
    <section>
      {/* HEADER */}

      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
            Accounts
          </h2>

          <p className="mt-0.5 text-[10px] text-gray-400">
            {cards.length > 0
              ? `${cards.length} card ${
                  cards.length === 1
                    ? "account"
                    : "accounts"
                }`
              : "Your bank and e-wallet cards"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CardViewSwitcher
            value={viewMode}
            onChange={setViewMode}
          />

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
      </div>

      {/* CARDS */}

      {cards.length > 0 ? (
        <>
          {/* MOBILE / TABLET: CLICKABLE STACK */}

          <MobileCardStack
            cards={cards}
            viewMode={viewMode}
            activeIndex={
              normalizedActiveIndex
            }
            onAdvance={
              handleAdvanceCard
            }
            onViewAll={onViewAll}
          />

          {/* DESKTOP: ORIGINAL HORIZONTAL CARDS */}

          <div
            className="
              hidden
              snap-x
              snap-mandatory
              gap-3
              overflow-x-auto
              pb-2
              lg:flex
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {cards.map((card) => (
              <MemberCard
                key={card.id}
                card={card}
                viewMode={viewMode}
                onClick={onViewAll}
              />
            ))}
          </div>
        </>
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

  const [cashAccount, setCashAccount] =
    useState(null);

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

  const [
    walletModalOpen,
    setWalletModalOpen,
  ] = useState(false);

  const [
    walletSaving,
    setWalletSaving,
  ] = useState(false);

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
          cashData,
        ] = await Promise.all([
          getFinanceSummary(),
          getMemberCards(),
          getMemberTransfers(),
          getCashAccount(),
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

        setCashAccount(
          cashData || {
            balance:
              summaryData
                ?.actual_money ||
              "0.00",
          },
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
     WALLET BALANCE
  ======================================================= */

  const handleSaveWalletBalance =
    async ({ amount }) => {
      if (walletSaving) {
        return;
      }

      try {
        setWalletSaving(true);

        await updateCashBalance(
          amount,
        );

        const [
          summaryData,
          cashData,
        ] = await Promise.all([
          getFinanceSummary(),
          getCashAccount(),
        ]);

        setSummary(summaryData);
        setCashAccount(cashData);
        setWalletModalOpen(false);

        toast.success(
          "Wallet balance updated.",
        );
      } catch (error) {
        console.error(
          "Unable to update wallet balance:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to update wallet balance.",
        );
      } finally {
        setWalletSaving(false);
      }
    };

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
          2. Quick actions
          3. Card accounts
          4. Transactions

          DESKTOP:
          Wallet
          Quick actions
          Card accounts + transactions below
      =================================================== */}

      {/* 1. WALLET */}

      <WalletHero summary={summary} />

      {/* 2. QUICK ACTIONS */}

      <div className="mt-3">
        <QuickActions
          onNavigate={navigate}
          onWallet={() =>
            setWalletModalOpen(true)
          }
        />
      </div>

      {/* 3. CARD ACCOUNTS

          The Datong cash wallet stays in the hero above.
          This strip intentionally renders member cards only.
      =================================================== */}

      <div className="mt-6">
        <CardsSection
          cards={cards}
          onViewAll={() =>
            navigate("/cards")
          }
        />
      </div>

      {/* 4. TRANSACTIONS */}

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

      <WalletBalanceModal
        open={walletModalOpen}
        cashAccount={cashAccount}
        submitting={walletSaving}
        onClose={() => {
          if (!walletSaving) {
            setWalletModalOpen(false);
          }
        }}
        onSubmit={handleSaveWalletBalance}
      />
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

  if (isMember) {
    return <MemberDashboard />;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return <InternalDashboard />;
}

export default Dashboard;
