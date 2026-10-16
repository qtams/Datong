import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeftRight,
  Banknote,
  CreditCard,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  LoaderCircle,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import toast from "react-hot-toast";

import AddMemberCardModal from "../../components/modals/AddMemberCardModal";
import TransferMoneyModal from "../../components/modals/TransferMoneyModal";
import WalletBalanceModal from "../../components/modals/WalletBalanceModal";
import MobileFloatingAddButton from "../../components/MobileFloatingAddButton";

import ReflectiveCard from "../../components/reactbits/ReflectiveCard";

import {
  createMemberCard,
  createTransfer,
  deleteMemberCard,
  getCashAccount,
  getFinanceSummary,
  getMemberCardCatalog,
  getMemberCards,
  updateCashBalance,
} from "../../services/memberFinanceApi";

import {
  confirmDelete,
} from "../../utils/sweetAlert";

/* =========================================================
   MONEY
========================================================= */

function formatPeso(value) {
  const amount = Number(
    value || 0,
  );

  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits:
        Number.isInteger(amount)
          ? 0
          : 2,
      maximumFractionDigits: 2,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
}

/* =========================================================
   HIDDEN MONEY
========================================================= */

function displayMoney(
  value,
  hidden,
) {
  if (hidden) {
    return "₱••••••";
  }

  return formatPeso(value);
}

/* =========================================================
   PROVIDER ID
========================================================= */

function getAccountProviderId(
  account,
) {
  const id =
    account?.provider?.id ??
    account?.card?.id ??
    account?.card_id ??
    account?.provider_id ??
    null;

  const numericId =
    Number(id);

  return Number.isFinite(
    numericId,
  )
    ? numericId
    : null;
}

/* =========================================================
   ACCOUNT GROUP
========================================================= */

function getAccountGroup(
  account,
) {
  const type = String(
    account?.provider?.type ||
      account?.card?.type ||
      "",
  ).toLowerCase();

  if (
    type.includes("credit")
  ) {
    return "credit";
  }

  return "cash";
}

/* =========================================================
   MOBILE CARD VIEW OPTIONS
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

const VIEW_MODES = [
  {
    id: "cards",
    label: "Landscape",
    icon: CreditCard,
  },
  {
    id: "portrait",
    label: "Portrait",
    icon: PortraitCardIcon,
  },
  {
    id: "grid",
    label: "Grid",
    icon: LayoutGrid,
  },
  {
    id: "stack",
    label: "Large",
    icon: WalletCards,
  },
  {
    id: "list",
    label: "List",
    icon: List,
  },
];

function ViewSwitcher({ value, onChange }) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-0.5
        rounded-full
        bg-gray-200/80
        p-1
        sm:hidden
      "
    >
      {VIEW_MODES.map(({ id, label, icon: Icon }) => {
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
            <Icon size={13} strokeWidth={active ? 2 : 1.6} />
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   NET WORTH
========================================================= */

function NetWorthSummary({
  summary,
  cardCount,
  hidden,
  onToggleHidden,
}) {
  return (
    <section
      className="
        mb-7

        rounded-[24px]

        border
        border-gray-100

        bg-white

        p-5

        shadow-[0_12px_40px_rgba(15,23,42,0.07)]

        sm:p-6
        lg:p-7
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]

            text-gray-400
          "
        >
          Net worth
        </p>

        <button
          type="button"
          onClick={
            onToggleHidden
          }
          aria-label={
            hidden
              ? "Show balances"
              : "Hide balances"
          }
          className="
            flex
            h-8
            w-8
            items-center
            justify-center

            rounded-full

            bg-gray-100

            text-gray-400

            transition-colors

            hover:bg-gray-200
            hover:text-gray-700
          "
        >
          {hidden ? (
            <EyeOff
              size={15}
              strokeWidth={1.6}
            />
          ) : (
            <Eye
              size={15}
              strokeWidth={1.6}
            />
          )}
        </button>
      </div>

      {/* TOTAL */}

      <motion.p
        key={`${summary?.total_money}-${hidden}`}
        initial={{
          opacity: 0,
          y: 4,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          mt-5

          text-[34px]
          font-semibold
          leading-none
          tracking-[-0.045em]

          text-gray-950

          sm:text-[40px]
          lg:text-[44px]
        "
      >
        {displayMoney(
          summary?.total_money,
          hidden,
        )}
      </motion.p>

      <p
        className="
          mt-3

          text-[10px]

          text-gray-400
        "
      >
        Wallet and savings combined
      </p>

      {/* BREAKDOWN */}

      <div
        className="
          mt-7

          grid
          grid-cols-3
          gap-3

          border-t
          border-gray-100

          pt-5

          sm:gap-6
        "
      >
        {/* CASH */}

        <div>
          <p
            className="
              text-[9px]
              font-medium
              text-gray-400
            "
          >
            Cash
          </p>

          <p
            className="
              mt-1

              truncate

              text-[12px]
              font-semibold

              text-gray-900

              sm:text-[14px]
            "
          >
            {displayMoney(
              summary?.actual_money,
              hidden,
            )}
          </p>
        </div>

        {/* SAVINGS */}

        <div>
          <p
            className="
              text-[9px]
              font-medium
              text-gray-400
            "
          >
            Savings
          </p>

          <p
            className="
              mt-1

              truncate

              text-[12px]
              font-semibold

              text-gray-900

              sm:text-[14px]
            "
          >
            {displayMoney(
              summary?.savings,
              hidden,
            )}
          </p>
        </div>

        {/* ACCOUNTS */}

        <div>
          <p
            className="
              text-[9px]
              font-medium
              text-gray-400
            "
          >
            Accounts
          </p>

          <p
            className="
              mt-1

              text-[12px]
              font-semibold

              text-gray-900

              sm:text-[14px]
            "
          >
            {cardCount}
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CARD SIZE

   Desktop always stays landscape.
========================================================= */

function getCardClassName(viewMode) {
  if (viewMode === "portrait") {
    return `
      w-[54vw]
      max-w-[205px]
      shrink-0
      snap-start

      sm:w-full
      sm:max-w-none
      sm:shrink
      sm:snap-none
    `;
  }

  if (viewMode === "cards") {
    return `
      w-[78vw]
      max-w-[310px]
      shrink-0
      snap-start

      sm:w-full
      sm:max-w-none
      sm:shrink
      sm:snap-none
    `;
  }

  if (viewMode === "stack") {
    return `
      w-full
      max-w-[470px]
      sm:max-w-none
    `;
  }

  return `
    w-full
    min-w-0
  `;
}

/* =========================================================
   REFLECTIVE CARD IMAGE

   IMPORTANT:
   - no outer background
   - no border
   - no drop shadow
   - keeps the ReactBits reflection / glare
========================================================= */

function ReflectiveBankImage({ image, alt }) {
  return (
    <ReflectiveCard
      width="100%"
      height="100%"
      radius={18}
      theme="dark"
      tint="#ffffff"
      metalness={0.95}
      roughness={0.2}
      blurStrength={5}
      grayscale={0}
      warp={0.4}
      warpScale={1}
      shine={1}
      bevel={0}
      glare={0.5}
      enableTilt
      tiltStrength={7}
      intro={false}
      className="
        h-full
        w-full
        !max-w-none
        bg-transparent
        [&>div]:!bg-transparent
        [&>div>div:last-child]:!hidden
      "
      style={{
        "--rc-pad": "0px",
        "--rc-shadow": "none",
        boxShadow: "none",
        background: "transparent",
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-transparent">
        {image ? (
          <img
            src={image}
            alt={alt}
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-[#151515] text-white/60">
            <CreditCard size={26} strokeWidth={1.4} />
          </div>
        )}
      </div>
    </ReflectiveCard>
  );
}

/* =========================================================
   SAVINGS CARD

   Landscape option -> landscape_image_url
   Portrait option  -> portrait_image_url
   Desktop          -> landscape_image_url
========================================================= */

function SavingsCard({
  account,
  hidden,
  viewMode,
  removing = false,
  onTransfer,
  onRemove,
}) {
  const provider = account?.provider || {};

  const landscapeImage =
    provider?.landscape_image_url || provider?.portrait_image_url || "";

  const portraitImage =
    provider?.portrait_image_url || provider?.landscape_image_url || "";

  const portraitMode = viewMode === "portrait";

  const mobileImage = portraitMode ? portraitImage : landscapeImage;

  const name = account?.name || provider?.name || "Savings";
  const amount = account?.balance || "0.00";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{
        opacity: removing ? 0.45 : 1,
        y: 0,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`
        group
        relative
        bg-transparent
        ${portraitMode ? "aspect-[0.64/1]" : "aspect-[1.586/1]"}
        sm:aspect-[1.586/1]
        ${getCardClassName(viewMode)}
      `}
    >
      {/* MOBILE IMAGE */}
      <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-transparent sm:hidden">
        <ReflectiveBankImage
          image={mobileImage}
          alt={`${name} ${portraitMode ? "portrait" : "landscape"}`}
        />
      </div>

      {/* DESKTOP ALWAYS LANDSCAPE */}
      <div className="absolute inset-0 hidden overflow-hidden rounded-[18px] bg-transparent sm:block">
        <ReflectiveBankImage
          image={landscapeImage}
          alt={`${name} landscape`}
        />
      </div>

      {/* NAME + MONEY ONLY. NO GRADIENT / NO BACKGROUND. */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-[7%]
          left-[7%]
          z-20
          max-w-[78%]
        "
      >
        <p
          className="
            truncate
            text-[9px]
            font-medium
            text-white
            [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]
          "
        >
          {name}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-[13px]
            font-bold
            tracking-[-0.02em]
            text-white
            [text-shadow:0_1px_5px_rgba(0,0,0,1)]
          "
        >
          {displayMoney(amount, hidden)}
        </p>
      </div>

      <button
        type="button"
        disabled={removing}
        onClick={() => onTransfer?.(account)}
        aria-label={`Transfer from ${name}`}
        className="absolute inset-0 z-20 rounded-[18px] bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      />

      <button
        type="button"
        disabled={removing}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove?.(account);
        }}
        aria-label={`Remove ${name}`}
        title={`Remove ${name}`}
        className="
          absolute
          right-2
          top-2
          z-30
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          bg-black/40
          text-white
          backdrop-blur-md
          transition-all
          hover:bg-red-600
          disabled:cursor-not-allowed
          sm:opacity-0
          sm:group-hover:opacity-100
        "
      >
        {removing ? (
          <LoaderCircle size={11} className="animate-spin" />
        ) : (
          <Trash2 size={11} strokeWidth={1.8} />
        )}
      </button>
    </motion.div>
  );
}

/* =========================================================
   CASH CARD

   MOBILE + DESKTOP

   Previously this was mobile-only.

   Now it appears in the desktop account grid too.
========================================================= */

function CashCard({
  balance,
  hidden,
  viewMode,
  onEdit,
  onTransfer,
}) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 8,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.18,
        ease: "easeOut",
      }}
      className={`
        group
        relative

        ${viewMode === "portrait" ? "aspect-[0.64/1]" : "aspect-[1.586/1]"}
        sm:aspect-[1.586/1]

        overflow-hidden

        rounded-[18px]

        bg-[#111111]

        text-white

        shadow-[0_8px_24px_rgba(15,23,42,0.12)]

        ${getCardClassName(
          viewMode,
        )}
      `}
    >
      {/* SURFACE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0

          bg-gradient-to-br

          from-white/[0.08]
          via-transparent
          to-black/20
        "
      />

      {/* SUBTLE LIGHT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute

          -right-[20%]
          -top-[40%]

          h-[150%]
          w-[65%]

          rotate-[25deg]

          bg-gradient-to-r

          from-transparent
          via-white/[0.025]
          to-transparent

          blur-2xl
        "
      />

      {/* CLICK */}

      <button
        type="button"
        onClick={onTransfer}
        aria-label="Transfer cash"
        className="
          absolute
          inset-0

          z-10

          w-full

          text-left

          outline-none

          focus-visible:ring-2
          focus-visible:ring-white
          focus-visible:ring-inset
        "
      >
        {/* WALLET ICON */}

        <div
          className="
            absolute

            left-[7%]
            top-[14%]

            flex
            h-9
            w-11
            items-center
            justify-center

            rounded-lg

            border
            border-white/10

            bg-white/[0.08]
          "
        >
          <Banknote
            size={16}
            strokeWidth={1.5}
          />
        </div>

        {/* NAME + AMOUNT */}

        <div
          className="
            absolute

            bottom-[11%]
            left-[7%]

            max-w-[70%]
          "
        >
          <p
            className="
              text-[8px]
              font-medium

              text-white/75

              sm:text-[9px]
            "
          >
            Cash
          </p>

          <p
            className="
              mt-0.5

              truncate

              text-[12px]
              font-bold
              tracking-[-0.02em]

              text-white

              sm:text-[13px]
            "
          >
            {displayMoney(
              balance,
              hidden,
            )}
          </p>
        </div>
      </button>

      {/* ACTIONS */}

      <div
        className="
          absolute

          bottom-2.5
          right-2.5

          z-20

          flex
          gap-1

          sm:opacity-0

          sm:transition-opacity

          sm:group-hover:opacity-100
        "
      >
        {/* EDIT */}

        <button
          type="button"
          onClick={(
            event,
          ) => {
            event.stopPropagation();

            onEdit();
          }}
          aria-label="Edit cash balance"
          title="Edit cash balance"
          className="
            flex
            h-7
            w-7
            items-center
            justify-center

            rounded-full

            bg-black/45

            text-white

            backdrop-blur-md

            transition-colors

            hover:bg-black/75
          "
        >
          <Plus
            size={12}
          />
        </button>

        {/* TRANSFER */}

        <button
          type="button"
          onClick={(
            event,
          ) => {
            event.stopPropagation();

            onTransfer();
          }}
          aria-label="Transfer cash"
          title="Transfer cash"
          className="
            flex
            h-7
            w-7
            items-center
            justify-center

            rounded-full

            bg-black/45

            text-white

            backdrop-blur-md

            transition-colors

            hover:bg-black/75
          "
        >
          <ArrowLeftRight
            size={11}
          />
        </button>
      </div>
    </motion.div>
  );
}

/* =========================================================
   ADD CARD
========================================================= */

function AddCardSlot({
  viewMode,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{
        scale: 0.98,
      }}
      className={`
        hidden
        items-center
        sm:flex
        justify-center

        rounded-[18px]

        border
        border-dashed
        border-gray-300

        bg-transparent

        text-gray-400

        transition-all

        hover:border-gray-400
        hover:bg-white/60
        hover:text-gray-700

        ${getCardClassName(
          viewMode,
        )}
      `}
      style={{
        aspectRatio:
          "1.586 / 1",
      }}
    >
      <div
        className="
          text-center
        "
      >
        <div
          className="
            mx-auto

            flex
            h-9
            w-9
            items-center
            justify-center

            rounded-full

            border
            border-current
          "
        >
          <Plus
            size={14}
            strokeWidth={1.7}
          />
        </div>

        <p
          className="
            mt-2

            text-[9px]
            font-medium
          "
        >
          Add card
        </p>
      </div>
    </motion.button>
  );
}

/* =========================================================
   ACCOUNT LAYOUT

   MOBILE:
   Landscape = horizontal landscape cards
   Portrait = horizontal portrait cards
   Grid = two columns
   Large = one column
   List = one column

   DESKTOP:
   Always responsive grid.
========================================================= */

function AccountLayout({ mode, children }) {
  if (mode === "cards" || mode === "portrait") {
    return (
      <div
        className="
          -mx-4
          flex
          snap-x
          snap-mandatory
          gap-3
          overflow-x-auto
          overflow-y-visible
          px-4
          pb-2
          touch-auto
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          sm:mx-0
          sm:grid
          sm:grid-cols-3
          sm:gap-4
          sm:overflow-visible
          sm:px-0
          sm:pb-0

          lg:grid-cols-4
          lg:gap-5
        "
      >
        {children}
      </div>
    );
  }

  if (mode === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {children}
      </div>
    );
  }

  if (mode === "stack") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {children}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {children}
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function CardsSkeleton() {
  return (
    <div
      className="
        mx-auto

        min-h-[calc(100vh-120px)]

        w-full
        max-w-[1180px]

        pb-32
        pt-2

        sm:pb-12
        sm:pt-5
      "
    >
      {/* NET WORTH */}

      <div
        className="
          mb-7

          rounded-[24px]

          border
          border-gray-100

          bg-white

          p-5

          shadow-[0_12px_40px_rgba(15,23,42,0.07)]
        "
      >
        <div
          className="
            h-3
            w-20

            animate-pulse

            rounded

            bg-gray-200
          "
        />

        <div
          className="
            mt-5

            h-10
            w-52

            animate-pulse

            rounded

            bg-gray-200
          "
        />

        <div
          className="
            mt-7

            grid
            grid-cols-3

            gap-4

            border-t
            border-gray-100

            pt-5
          "
        >
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
              >
                <div
                  className="
                    h-2
                    w-12

                    animate-pulse

                    rounded

                    bg-gray-200
                  "
                />

                <div
                  className="
                    mt-2

                    h-4
                    w-20

                    animate-pulse

                    rounded

                    bg-gray-200
                  "
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* SECTION */}

      <div
        className="
          px-4

          sm:px-0
        "
      >
        <div
          className="
            mb-4

            h-3
            w-24

            animate-pulse

            rounded

            bg-gray-200
          "
        />

        <div
          className="
            -mx-4

            flex
            gap-3

            overflow-hidden

            px-4

            sm:mx-0

            sm:grid
            sm:grid-cols-3

            sm:px-0

            lg:grid-cols-4
            lg:gap-5
          "
        >
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="
                  aspect-[0.64/1]
                  sm:aspect-[1.586/1]

                  w-[56vw]
                  max-w-[210px]

                  shrink-0

                  animate-pulse

                  rounded-[18px]

                  bg-gray-200

                  sm:w-full
                  sm:max-w-none
                "
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

function CardsPage({
  loading = false,
}) {
  /* =======================================================
     SUMMARY
  ======================================================= */

  const [
    summary,
    setSummary,
  ] = useState({
    savings: "0.00",
    actual_money: "0.00",
    total_money: "0.00",
    currency: "PHP",
  });

  /* =======================================================
     CARDS
  ======================================================= */

  const [
    cards,
    setCards,
  ] = useState([]);

  const [
    catalog,
    setCatalog,
  ] = useState([]);

  const [
    cashAccount,
    setCashAccount,
  ] = useState(null);

  const [
    dataLoading,
    setDataLoading,
  ] = useState(true);

  /* =======================================================
     VIEW
  ======================================================= */

  const [viewMode, setViewMode] = useState("cards");

  const [
    hideBalances,
    setHideBalances,
  ] = useState(false);

  /* =======================================================
     ADD CARD
  ======================================================= */

  const [
    addModalOpen,
    setAddModalOpen,
  ] = useState(false);

  const [
    addingCard,
    setAddingCard,
  ] = useState(false);

  /* =======================================================
     TRANSFER
  ======================================================= */

  const [
    transferModalOpen,
    setTransferModalOpen,
  ] = useState(false);

  const [
    transferSource,
    setTransferSource,
  ] = useState(null);

  const [
    transferring,
    setTransferring,
  ] = useState(false);

  /* =======================================================
     CASH
  ======================================================= */

  const [
    walletModalOpen,
    setWalletModalOpen,
  ] = useState(false);

  const [
    walletSaving,
    setWalletSaving,
  ] = useState(false);

  /* =======================================================
     DELETE
  ======================================================= */

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadFinance =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (!silent) {
            setDataLoading(
              true,
            );
          }

          const [
            summaryData,
            cardsData,
            catalogData,
            cashData,
          ] =
            await Promise.all([
              getFinanceSummary(),

              getMemberCards(),

              getMemberCardCatalog(),

              getCashAccount(),
            ]);

          setSummary(
            summaryData || {
              savings:
                "0.00",

              actual_money:
                "0.00",

              total_money:
                "0.00",

              currency:
                "PHP",
            },
          );

          setCards(
            Array.isArray(
              cardsData,
            )
              ? cardsData
              : [],
          );

          setCatalog(
            Array.isArray(
              catalogData,
            )
              ? catalogData
              : [],
          );

          setCashAccount(
            cashData ||
              null,
          );
        } catch (error) {
          console.error(
            "Unable to load member finance:",
            error,
          );

          toast.error(
            error?.message ||
              "Unable to load your accounts.",
          );
        } finally {
          setDataLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    loadFinance();
  }, [
    loadFinance,
  ]);

  /* =======================================================
     ACCOUNT GROUPS
  ======================================================= */

  const cashCards =
    useMemo(
      () =>
        cards.filter(
          (account) =>
            getAccountGroup(
              account,
            ) === "cash",
        ),
      [
        cards,
      ],
    );

  const creditCards =
    useMemo(
      () =>
        cards.filter(
          (account) =>
            getAccountGroup(
              account,
            ) === "credit",
        ),
      [
        cards,
      ],
    );

  /* =======================================================
     EXISTING PROVIDERS
  ======================================================= */

  const existingProviderIds =
    useMemo(() => {
      return new Set(
        cards
          .map(
            getAccountProviderId,
          )
          .filter(
            (id) =>
              id !== null,
          ),
      );
    }, [
      cards,
    ]);

  /* =======================================================
     AVAILABLE PROVIDERS
  ======================================================= */

  const availableCatalog =
    useMemo(
      () =>
        catalog.filter(
          (provider) =>
            !existingProviderIds.has(
              Number(
                provider?.id,
              ),
            ),
        ),
      [
        catalog,
        existingProviderIds,
      ],
    );

  const canAddCard =
    availableCatalog.length >
    0;

  /* =======================================================
     ADD CARD
  ======================================================= */

  const handleOpenAdd =
    () => {
      if (!canAddCard) {
        toast(
          "You already added all available cards.",
        );

        return;
      }

      setAddModalOpen(
        true,
      );
    };

  const handleAddCard =
    async (values) => {
      if (addingCard) {
        return;
      }

      try {
        setAddingCard(
          true,
        );

        await createMemberCard(
          values,
        );

        setAddModalOpen(
          false,
        );

        toast.success(
          "Savings card added.",
        );

        await loadFinance({
          silent: true,
        });
      } catch (error) {
        console.error(
          "Unable to add card:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to add card.",
        );
      } finally {
        setAddingCard(
          false,
        );
      }
    };

  /* =======================================================
     CASH BALANCE
  ======================================================= */

  const handleSaveWalletBalance =
    async ({
      amount,
    }) => {
      if (walletSaving) {
        return;
      }

      try {
        setWalletSaving(
          true,
        );

        await updateCashBalance(
          amount,
        );

        setWalletModalOpen(
          false,
        );

        toast.success(
          "Cash balance updated.",
        );

        await loadFinance({
          silent: true,
        });
      } catch (error) {
        console.error(
          "Unable to update cash balance:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to update cash balance.",
        );
      } finally {
        setWalletSaving(
          false,
        );
      }
    };

  /* =======================================================
     TRANSFER
  ======================================================= */

  const handleOpenTransfer =
    (
      source = null,
    ) => {
      setTransferSource(
        source,
      );

      setTransferModalOpen(
        true,
      );
    };

  const handleOpenWalletTransfer =
    () => {
      if (
        cards.length ===
        0
      ) {
        toast(
          "Add a savings card first.",
        );

        return;
      }

      handleOpenTransfer({
        id:
          cashAccount?.id ??
          null,

        type:
          "cash",

        name:
          "Cash",

        balance:
          cashAccount
            ?.balance ??
          summary
            ?.actual_money ??
          "0.00",
      });
    };

  const handleTransfer =
    async (values) => {
      if (transferring) {
        return;
      }

      try {
        setTransferring(
          true,
        );

        await createTransfer(
          values,
        );

        setTransferModalOpen(
          false,
        );

        setTransferSource(
          null,
        );

        toast.success(
          "Money transferred successfully.",
        );

        await loadFinance({
          silent: true,
        });
      } catch (error) {
        console.error(
          "Unable to transfer money:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to transfer money.",
        );
      } finally {
        setTransferring(
          false,
        );
      }
    };

  /* =======================================================
     REMOVE CARD
  ======================================================= */

  const handleRemoveCard =
    async (account) => {
      if (
        !account ||
        removingId !== null
      ) {
        return;
      }

      const cardName =
        account?.name ||
        account?.provider
          ?.name ||
        "this card";

      const confirmed =
        await confirmDelete({
          title:
            "Remove card?",

          text:
            `Remove ${cardName}? Its ${formatPeso(
              account?.balance ||
                0,
            )} balance will be subtracted from your savings.`,

          confirmText:
            "Remove card",

          cancelText:
            "Cancel",
        });

      if (!confirmed) {
        return;
      }

      try {
        setRemovingId(
          account.id,
        );

        await deleteMemberCard(
          account.id,
        );

        toast.success(
          "Card removed.",
        );

        await loadFinance({
          silent: true,
        });
      } catch (error) {
        console.error(
          "Unable to remove card:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to remove card.",
        );
      } finally {
        setRemovingId(
          null,
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading ||
    dataLoading
  ) {
    return (
      <CardsSkeleton />
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <main
        className="
          relative

          mx-auto

          min-h-[calc(100vh-120px)]

          w-full
          max-w-[1180px]

          pb-32
          pt-2

          sm:pb-12
          sm:pt-5
        "
      >
        {/* =================================================
            NET WORTH
        ================================================= */}

        <NetWorthSummary
          summary={summary}
          cardCount={
            cards.length
          }
          hidden={
            hideBalances
          }
          onToggleHidden={() =>
            setHideBalances(
              (current) =>
                !current,
            )
          }
        />

        {/* =================================================
            CASH & BANK

            Mobile gets px-4 so:
            - label aligns
            - controls align
            - first card aligns
        ================================================= */}

        <section
          className="
            px-4

            sm:px-0
          "
        >
          {/* HEADER */}

          <div
            className="
              mb-4

              flex
              items-center
              justify-between

              gap-3
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <h2
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]

                  text-gray-400
                "
              >
                Cash & Bank
              </h2>

              <p
                className="
                  mt-1

                  text-[9px]

                  text-gray-400
                "
              >
                {
                  cashCards.length
                }{" "}
                {cashCards.length ===
                1
                  ? "account"
                  : "accounts"}
              </p>
            </div>

            <ViewSwitcher
              value={viewMode}
              onChange={setViewMode}
            />
          </div>

          {/* =================================================
              ACCOUNTS

              Cash now appears on:
              MOBILE + DESKTOP
          ================================================= */}

          <AccountLayout
            mode={
              viewMode
            }
          >
            {/* CASH */}

            <CashCard
              balance={
                summary
                  ?.actual_money ||
                0
              }
              hidden={
                hideBalances
              }
              viewMode={
                viewMode
              }
              onEdit={() =>
                setWalletModalOpen(
                  true,
                )
              }
              onTransfer={
                handleOpenWalletTransfer
              }
            />

            {/* BANK / E-WALLET */}

            <AnimatePresence
              mode="popLayout"
            >
              {cashCards.map(
                (account) => (
                  <SavingsCard
                    key={
                      account.id
                    }
                    account={
                      account
                    }
                    hidden={
                      hideBalances
                    }
                    viewMode={
                      viewMode
                    }
                    removing={
                      removingId ===
                      account.id
                    }
                    onTransfer={
                      handleOpenTransfer
                    }
                    onRemove={
                      handleRemoveCard
                    }
                  />
                ),
              )}
            </AnimatePresence>

            {/* ADD */}

            {canAddCard && (
              <AddCardSlot
                viewMode={
                  viewMode
                }
                onClick={
                  handleOpenAdd
                }
              />
            )}
          </AccountLayout>
        </section>

        {/* =================================================
            CREDIT
        ================================================= */}

        {creditCards.length >
          0 && (
          <section
            className="
              mt-9

              px-4

              sm:px-0
            "
          >
            <div
              className="
                mb-4

                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]

                    text-gray-400
                  "
                >
                  Credit
                </h2>

                <p
                  className="
                    mt-1

                    text-[9px]

                    text-gray-400
                  "
                >
                  {
                    creditCards.length
                  }{" "}
                  {creditCards.length ===
                  1
                    ? "account"
                    : "accounts"}
                </p>
              </div>
            </div>

            <AccountLayout
              mode={
                viewMode
              }
            >
              <AnimatePresence
                mode="popLayout"
              >
                {creditCards.map(
                  (account) => (
                    <SavingsCard
                      key={
                        account.id
                      }
                      account={
                        account
                      }
                      hidden={
                        hideBalances
                      }
                      viewMode={
                        viewMode
                      }
                      removing={
                        removingId ===
                        account.id
                      }
                      onTransfer={
                        handleOpenTransfer
                      }
                      onRemove={
                        handleRemoveCard
                      }
                    />
                  ),
                )}
              </AnimatePresence>
            </AccountLayout>
          </section>
        )}
      </main>

      {/* ===================================================
          MOBILE FLOATING ADD

          Always visible on the Cards page.
          If all providers are already added, handleOpenAdd()
          shows the existing toast instead of opening the modal.
      =================================================== */}

      <AnimatePresence>
        {!addModalOpen && !walletModalOpen && !transferModalOpen && (
          <MobileFloatingAddButton
            label="Add card"
            onClick={handleOpenAdd}
          />
        )}
      </AnimatePresence>

      {/* ===================================================
          ADD CARD MODAL
      =================================================== */}

      <AnimatePresence>
        {addModalOpen && (
          <AddMemberCardModal
            open={
              addModalOpen
            }
            catalog={
              catalog
            }
            existingCards={
              cards
            }
            submitting={
              addingCard
            }
            onClose={() => {
              if (
                addingCard
              ) {
                return;
              }

              setAddModalOpen(
                false,
              );
            }}
            onSubmit={
              handleAddCard
            }
          />
        )}
      </AnimatePresence>

      {/* ===================================================
          CASH BALANCE MODAL
      =================================================== */}

      <AnimatePresence>
        {walletModalOpen && (
          <WalletBalanceModal
            open={
              walletModalOpen
            }
            cashAccount={
              cashAccount
            }
            submitting={
              walletSaving
            }
            onClose={() => {
              if (
                walletSaving
              ) {
                return;
              }

              setWalletModalOpen(
                false,
              );
            }}
            onSubmit={
              handleSaveWalletBalance
            }
          />
        )}
      </AnimatePresence>

      {/* ===================================================
          TRANSFER MODAL
      =================================================== */}

      <AnimatePresence>
        {transferModalOpen && (
          <TransferMoneyModal
            open={
              transferModalOpen
            }
            cards={
              cards
            }
            cashAccount={
              cashAccount
            }
            initialSource={
              transferSource
            }
            submitting={
              transferring
            }
            onClose={() => {
              if (
                transferring
              ) {
                return;
              }

              setTransferModalOpen(
                false,
              );

              setTransferSource(
                null,
              );
            }}
            onSubmit={
              handleTransfer
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default CardsPage;