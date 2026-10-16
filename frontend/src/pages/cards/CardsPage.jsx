import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  LoaderCircle,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";

import AddMemberCardModal from "../../components/modals/AddMemberCardModal";
import TransferMoneyModal from "../../components/modals/TransferMoneyModal";
import WalletBalanceModal from "../../components/modals/WalletBalanceModal";

import datongWallet from "../../assets/datong_wallet.webp";

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

import { confirmDelete } from "../../utils/sweetAlert";

/* =========================================================
   MONEY
========================================================= */

function formatPeso(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/* =========================================================
   CARD FONT
========================================================= */

const CARD_FONT_ID = "member-card-font";

const CARD_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap";

const CARD_FONT_STYLE = {
  fontFamily:
    '"Share Tech Mono", "OCR A Std", "OCR-A", "Courier New", ui-monospace, monospace',
  fontVariantNumeric: "tabular-nums",
};

const CARD_TEXT_STYLE = {
  ...CARD_FONT_STYLE,
  textShadow:
    "0 1px 0 rgba(255,255,255,0.28), 0 -1px 0 rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)",
};

const MAX_TILT = 8;

/* =========================================================
   PROVIDER ID
========================================================= */

function getAccountProviderId(account) {
  const id =
    account?.provider?.id ??
    account?.card?.id ??
    account?.card_id ??
    account?.provider_id ??
    null;

  const numericId = Number(id);

  return Number.isFinite(numericId) ? numericId : null;
}

/* =========================================================
   REFLECTIVE CARD ART
========================================================= */

function ReflectiveCardArt({ image, alt, children }) {
  const frameRef = useRef(null);
  const tiltRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const apply = useCallback((values) => {
    const element = tiltRef.current;

    if (!element) {
      return;
    }

    Object.entries(values).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }, []);

  const handlePointerMove = (event) => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = frame.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const x = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );

    const y = Math.min(
      1,
      Math.max(0, (event.clientY - rect.top) / rect.height),
    );

    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      apply({
        "--mx": `${(x * 100).toFixed(2)}%`,
        "--my": `${(y * 100).toFixed(2)}%`,
        "--rx": `${((0.5 - y) * MAX_TILT * 2).toFixed(2)}deg`,
        "--ry": `${((x - 0.5) * MAX_TILT * 2).toFixed(2)}deg`,
        "--scale": "1.015",
        "--glare": "1",
      });
    });
  };

  const handlePointerLeave = () => {
    cancelAnimationFrame(rafRef.current);

    apply({
      "--rx": "0deg",
      "--ry": "0deg",
      "--scale": "1",
      "--glare": "0",
    });
  };

  const maskStyle = image
    ? {
        WebkitMaskImage: `url("${image}")`,
        maskImage: `url("${image}")`,
        WebkitMaskSize: "cover",
        maskSize: "cover",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }
    : {};

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className="
        absolute
        inset-0
        select-none
        bg-transparent
      "
      style={{
        perspective: "1000px",
      }}
    >
      <div
        ref={tiltRef}
        className="
          relative
          h-full
          w-full
          overflow-hidden
          rounded-[18px]
          bg-transparent
          will-change-transform
        "
        style={{
          "--mx": "50%",
          "--my": "50%",
          "--rx": "0deg",
          "--ry": "0deg",
          "--scale": "1",
          "--glare": "0",
          transform:
            "rotateX(var(--rx)) rotateY(var(--ry)) scale(var(--scale))",
          transformStyle: "preserve-3d",
          transition: "transform 180ms ease-out",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={alt}
            draggable={false}
            className="
              absolute
              inset-0
              h-full
              w-full
              select-none
              rounded-[18px]
              object-cover
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              rounded-[18px]
              bg-black
              text-white
            "
          >
            <WalletCards size={28} strokeWidth={1.4} />
          </div>
        )}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-[18px]
          "
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.14), transparent 38%, rgba(0,0,0,0.02))",
            mixBlendMode: "soft-light",
          }}
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
          "
          style={{
            ...maskStyle,
            backgroundImage:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 28%, rgba(0,0,0,0) 55%)",
          }}
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
          "
          style={{
            ...maskStyle,
            opacity: "var(--glare)",
            transition: "opacity 200ms ease-out",
            background:
              "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.14) 26%, transparent 58%)",
            mixBlendMode: "soft-light",
          }}
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
          "
          style={{
            ...maskStyle,
            opacity: "calc(var(--glare) * 0.75)",
            transition: "opacity 200ms ease-out",
            background:
              "linear-gradient(115deg, transparent calc(var(--mx) - 24%), rgba(255,255,255,0.30) var(--mx), transparent calc(var(--mx) + 24%))",
            mixBlendMode: "overlay",
          }}
        />

        {children}
      </div>
    </div>
  );
}

/* =========================================================
   SAVINGS CARD
========================================================= */

function SavingsCard({
  account,
  removing = false,
  onTransfer,
  onRemove,
}) {
  const provider = account?.provider || {};

  const image =
    provider.landscape_image_url ||
    provider.portrait_image_url ||
    "";

  const name =
    account?.name ||
    provider?.name ||
    "Savings";

  const balance =
    account?.balance ||
    "0.00";

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.98,
      }}
      animate={{
        opacity: removing ? 0.55 : 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
      }}
      transition={{
        duration: 0.18,
        ease: "easeOut",
      }}
      className="
        group
        relative
        block
        w-full
        rounded-[18px]
      "
      style={{
        aspectRatio: "1.586 / 1",
      }}
    >
      <motion.button
        type="button"
        disabled={removing}
        onClick={() => onTransfer?.(account)}
        aria-label={`${name}, balance ${formatPeso(
          balance,
        )}. Transfer money`}
        whileTap={{
          scale: 0.98,
        }}
        className="
          absolute
          inset-0
          rounded-[18px]
          bg-transparent
          text-left
          outline-none
          focus-visible:ring-2
          focus-visible:ring-black
          focus-visible:ring-offset-2
        "
      >
        <ReflectiveCardArt
          image={image}
          alt={provider?.name || name}
        >
          <div
            className="
              pointer-events-none
              absolute
              bottom-[10%]
              left-[7%]
              right-[7%]
              z-10
            "
          >
            <p
              style={CARD_TEXT_STYLE}
              className="
                truncate
                text-[11px]
                font-normal
                uppercase
                tracking-[0.12em]
                text-white
                sm:text-[13px]
                2xl:text-[15px]
              "
            >
              {name}
            </p>

            <p
              style={CARD_TEXT_STYLE}
              className="
                mt-0.5
                truncate
                text-[13px]
                font-normal
                tracking-[0.1em]
                text-white
                sm:text-[15px]
                2xl:text-[17px]
              "
            >
              {formatPeso(balance)}
            </p>
          </div>
        </ReflectiveCardArt>
      </motion.button>

      <div
        className="
          absolute
          bottom-2.5
          right-2.5
          z-20
          flex
          items-center
          gap-1.5
        "
      >
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            hidden
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-white
            opacity-0
            backdrop-blur-md
            transition-opacity
            group-hover:opacity-100
            sm:flex
          "
        >
          <ArrowLeftRight
            size={12}
            strokeWidth={1.7}
          />
        </span>

        <button
          type="button"
          disabled={removing}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.(account);
          }}
          aria-label={`Remove ${name}`}
          title={`Remove ${name}`}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-white
            outline-none
            backdrop-blur-md
            transition-all
            hover:bg-red-600
            focus-visible:opacity-100
            focus-visible:ring-2
            focus-visible:ring-white
            active:scale-90
            disabled:cursor-not-allowed
            sm:opacity-0
            sm:group-hover:opacity-100
          "
        >
          {removing ? (
            <LoaderCircle
              size={12}
              className="animate-spin"
            />
          ) : (
            <Trash2
              size={12}
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* =========================================================
   DATONG WALLET
========================================================= */

function DatongWalletSummary({
  balance = 0,
  className = "w-[185px] sm:w-[250px] lg:w-[300px]",
  onEdit,
  onTransfer,
}) {
  const maskStyle = {
    WebkitMaskImage: `url("${datongWallet}")`,
    maskImage: `url("${datongWallet}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -8,
        y: 4,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration: 0.22,
      }}
      className={`
        group/wallet
        relative
        aspect-[1.586/1]
        bg-transparent
        ${className}
      `}
    >
      <img
        src={datongWallet}
        alt="Datong Wallet"
        draggable={false}
        className="
          absolute
          inset-0
          z-[1]
          h-full
          w-full
          select-none
          bg-transparent
          object-contain
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
        "
        style={{
          ...maskStyle,
          backgroundImage:
            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0) 48%)",
        }}
      />

      {/* BALANCE */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[10%]
          left-[14%]
          z-[3]
        "
      >
        <p
          style={CARD_FONT_STYLE}
          className="
            text-[7px]
            font-normal
            uppercase
            tracking-[0.16em]
            text-white/70
            sm:text-[10px]
            lg:text-[11px]
          "
        >
          Datong Wallet
        </p>

        <p
          style={CARD_TEXT_STYLE}
          className="
            mt-0.5
            text-[17px]
            font-normal
            tracking-[0.08em]
            text-white
            sm:text-[23px]
            lg:text-[27px]
          "
        >
          {formatPeso(balance)}
        </p>
      </div>

      {/* ACTIONS */}

      <div
        className="
          absolute
          right-[8%]
          top-[10%]
          z-20
          flex
          items-center
          gap-1.5
        "
      >
        {onEdit && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            aria-label="Set wallet balance"
            title="Set wallet balance"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-black/50
              text-white
              outline-none
              backdrop-blur-md
              transition-all
              hover:bg-black/75
              active:scale-90
              focus-visible:ring-2
              focus-visible:ring-white
            "
          >
            <Plus
              size={14}
              strokeWidth={1.9}
            />
          </button>
        )}

        {onTransfer && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTransfer();
            }}
            aria-label="Transfer wallet money"
            title="Transfer to savings"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-black/50
              text-white
              outline-none
              backdrop-blur-md
              transition-all
              hover:bg-black/75
              active:scale-90
              focus-visible:ring-2
              focus-visible:ring-white
            "
          >
            <ArrowLeftRight
              size={13}
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   SAVINGS SUMMARY
========================================================= */

function SavingsSummary({
  balance = 0,
}) {
  return (
    <motion.div
      key={balance}
      initial={{
        opacity: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        mx-auto
        flex
        min-h-[120px]
        w-full
        max-w-[520px]
        flex-col
        items-center
        justify-center
        rounded-[26px]
        bg-black
        px-5
        py-5
        text-center
        sm:min-h-[150px]
        sm:px-7
        sm:py-6
      "
    >
      <p
        style={CARD_FONT_STYLE}
        className="
          text-[11px]
          font-normal
          uppercase
          tracking-[0.22em]
          text-white/60
          sm:text-[14px]
        "
      >
        Savings
      </p>

      <p
        style={CARD_FONT_STYLE}
        className="
          mt-2
          text-[29px]
          font-normal
          tracking-[0.04em]
          text-white
          sm:text-[40px]
        "
      >
        {formatPeso(balance)}
      </p>
    </motion.div>
  );
}

/* =========================================================
   MOBILE BALANCE FLIP
========================================================= */

function BalanceFlipCard({
  savings = 0,
  wallet = 0,
  onWalletEdit,
  onWalletTransfer,
}) {
  const [
    showWallet,
    setShowWallet,
  ] = useState(false);

  const hiddenFace = {
    backfaceVisibility:
      "hidden",

    WebkitBackfaceVisibility:
      "hidden",
  };

  return (
    <div
      className="
        relative
        mx-auto
        aspect-[1.586/1]
        w-full
        max-w-[360px]
        rounded-[26px]
        bg-transparent
        [-webkit-tap-highlight-color:transparent]
      "
      style={{
        perspective:
          "1200px",
      }}
    >
      <motion.div
        initial={false}
        animate={{
          rotateY:
            showWallet
              ? 180
              : 0,
        }}
        transition={{
          duration: 0.5,
          ease: [
            0.4,
            0,
            0.2,
            1,
          ],
        }}
        className="
          absolute
          inset-0
        "
        style={{
          transformStyle:
            "preserve-3d",
        }}
      >
        {/* =================================================
            SAVINGS

            Tap the whole Savings card to show the wallet.
            No separate flip icon.
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setShowWallet(
              true,
            )
          }
          aria-label="Savings. Tap to show Datong Wallet"
          className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            rounded-[26px]
            bg-black
            px-5
            text-center
            outline-none
            transition-transform
            active:scale-[0.99]
          "
          style={{
            ...hiddenFace,
            pointerEvents:
              showWallet
                ? "none"
                : "auto",
          }}
        >
          <p
            style={CARD_FONT_STYLE}
            className="
              text-[11px]
              font-normal
              uppercase
              tracking-[0.22em]
              text-white/60
            "
          >
            Savings
          </p>

          <p
            style={CARD_FONT_STYLE}
            className="
              mt-2
              text-[34px]
              font-normal
              tracking-[0.04em]
              text-white
            "
          >
            {formatPeso(
              savings,
            )}
          </p>

          <p
            className="
              mt-3
              text-[8px]
              uppercase
              tracking-[0.18em]
              text-white/35
            "
          >
            Tap to view wallet
          </p>
        </button>

        {/* =================================================
            WALLET

            Tap the wallet background to return to Savings.

            The edit and transfer buttons already stop event
            propagation, so using them will not flip the card.
        ================================================= */}

        <div
          onClick={() =>
            setShowWallet(
              false,
            )
          }
          className="
            absolute
            inset-0
            cursor-pointer
            [-webkit-tap-highlight-color:transparent]
          "
          style={{
            ...hiddenFace,
            transform:
              "rotateY(180deg)",
            pointerEvents:
              showWallet
                ? "auto"
                : "none",
          }}
        >
          <DatongWalletSummary
            balance={wallet}
            className="
              h-full
              w-full
            "
            onEdit={
              onWalletEdit
            }
            onTransfer={
              onWalletTransfer
            }
          />
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   ADD CARD SLOT
========================================================= */

function AddCardSlot({
  onClick,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{
        scale: 0.98,
      }}
      className="
        flex
        w-full
        items-center
        justify-center
        rounded-[18px]
        border
        border-dashed
        border-gray-300
        bg-gray-100/40
        text-gray-400
        outline-none
        transition-all
        hover:border-gray-400
        hover:bg-gray-100
        hover:text-gray-700
        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-2
      "
      style={{
        aspectRatio:
          "1.586 / 1",
      }}
    >
      <div className="text-center">
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
            text-[8px]
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
   EMPTY CARD
========================================================= */

function EmptyCardSlot() {
  return (
    <div
      aria-hidden="true"
      className="
        w-full
        rounded-[18px]
        bg-gray-200/70
      "
      style={{
        aspectRatio:
          "1.586 / 1",
      }}
    />
  );
}

/* =========================================================
   LOADING CARD
========================================================= */

function LoadingCard() {
  return (
    <div
      className="
        w-full
        animate-pulse
        rounded-[18px]
        bg-gray-200
      "
      style={{
        aspectRatio:
          "1.586 / 1",
      }}
    />
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
        px-1
        pb-28
        pt-8
        sm:px-4
        sm:pb-10
        sm:pt-12
      "
    >
      <div
        className="
          mx-auto
          mb-8
          aspect-[1.586/1]
          w-full
          max-w-[360px]
          animate-pulse
          rounded-[26px]
          bg-black
          sm:hidden
        "
      />

      <div
        className="
          relative
          hidden
          min-h-[255px]
          sm:block
          lg:min-h-[220px]
        "
      >
        <div
          className="
            absolute
            left-0
            top-0
            aspect-[1.586/1]
            w-[250px]
            animate-pulse
            rounded-[20px]
            bg-gray-200
            lg:w-[300px]
          "
        />

        <div
          className="
            mx-auto
            flex
            min-h-[150px]
            w-full
            max-w-[520px]
            animate-pulse
            flex-col
            items-center
            justify-center
            rounded-[26px]
            bg-black
          "
        >
          <div
            className="
              h-3
              w-16
              rounded
              bg-white/20
            "
          />

          <div
            className="
              mt-3
              h-10
              w-44
              rounded
              bg-white/20
            "
          />
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-x-3
          gap-y-5
          sm:grid-cols-3
          sm:gap-5
          lg:grid-cols-4
        "
      >
        {Array.from({
          length: 8,
        }).map(
          (
            _,
            index,
          ) => (
            <LoadingCard
              key={
                index
              }
            />
          ),
        )}
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
  const [
    summary,
    setSummary,
  ] = useState({
    savings:
      "0.00",
    actual_money:
      "0.00",
    total_money:
      "0.00",
    currency:
      "PHP",
  });

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
     WALLET BALANCE
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
     REMOVE
  ======================================================= */

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  /* =======================================================
     FONT
  ======================================================= */

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    if (
      document.getElementById(
        CARD_FONT_ID,
      )
    ) {
      return;
    }

    const link =
      document.createElement(
        "link",
      );

    link.id =
      CARD_FONT_ID;

    link.rel =
      "stylesheet";

    link.href =
      CARD_FONT_URL;

    document.head.appendChild(
      link,
    );
  }, []);

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
            await Promise.all(
              [
                getFinanceSummary(),
                getMemberCards(),
                getMemberCardCatalog(),
                getCashAccount(),
              ],
            );

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
        } catch (
          error
        ) {
          console.error(
            "Unable to load member finance:",
            error,
          );

          toast.error(
            error?.message ||
              "Unable to load your savings.",
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
     CATALOG
  ======================================================= */

  const existingProviderIds =
    useMemo(() => {
      const ids =
        cards
          .map(
            (
              account,
            ) =>
              getAccountProviderId(
                account,
              ),
          )
          .filter(
            (id) =>
              id !== null,
          );

      return new Set(
        ids,
      );
    }, [
      cards,
    ]);

  const availableCatalog =
    useMemo(
      () =>
        catalog.filter(
          (
            provider,
          ) =>
            !existingProviderIds.has(
              Number(
                provider.id,
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

  const handleAddCard =
    async (
      values,
    ) => {
      if (
        addingCard
      ) {
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
      } catch (
        error
      ) {
        console.error(
          "Unable to add member card:",
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

  const handleOpenAdd =
    () => {
      if (
        !canAddCard
      ) {
        toast(
          "You already added all available cards.",
        );

        return;
      }

      setAddModalOpen(
        true,
      );
    };

  /* =======================================================
     WALLET BALANCE
  ======================================================= */

  const handleOpenWalletBalance =
    () => {
      setWalletModalOpen(
        true,
      );
    };

  const handleSaveWalletBalance =
    async ({
      amount,
    }) => {
      if (
        walletSaving
      ) {
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
          "Wallet balance updated.",
        );

        await loadFinance({
          silent: true,
        });
      } catch (
        error
      ) {
        console.error(
          "Unable to update wallet balance:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to update wallet.",
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

  const handleOpenTransfer = (
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
          "Datong Wallet",

        balance:
          cashAccount
            ?.balance ??
          summary
            .actual_money ??
          "0.00",
      });
    };

  const handleTransfer =
    async (
      values,
    ) => {
      if (
        transferring
      ) {
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
      } catch (
        error
      ) {
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
    async (
      account,
    ) => {
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
              account
                ?.balance ||
                0,
            )} balance will be subtracted from your savings.`,

          confirmText:
            "Remove card",

          cancelText:
            "Cancel",
        });

      if (
        !confirmed
      ) {
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
          "Card removed. Savings updated.",
        );

        await loadFinance({
          silent: true,
        });
      } catch (
        error
      ) {
        console.error(
          "Unable to remove member card:",
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

  const minimumSlots =
    8;

  const emptySlots =
    Math.max(
      0,
      minimumSlots -
        cards.length,
    );

  return (
    <>
      <main
        className="
          relative
          mx-auto
          min-h-[calc(100vh-120px)]
          w-full
          max-w-[1180px]
          px-1
          pb-32
          pt-8
          sm:px-4
          sm:pb-12
          sm:pt-12
        "
      >
        {/* =================================================
            MOBILE
        ================================================= */}

        <section
          className="
            mb-8
            sm:hidden
          "
        >
          <BalanceFlipCard
            savings={
              summary.savings ||
              0
            }
            wallet={
              summary
                .actual_money ||
              0
            }
            onWalletEdit={
              handleOpenWalletBalance
            }
            onWalletTransfer={
              handleOpenWalletTransfer
            }
          />
        </section>

        {/* =================================================
            DESKTOP / TABLET
        ================================================= */}

        <section
          className="
            relative
            hidden
            min-h-[255px]
            sm:block
            lg:min-h-[220px]
          "
        >
          <div
            className="
              absolute
              left-0
              top-0
              z-10
            "
          >
            <DatongWalletSummary
              balance={
                summary
                  .actual_money ||
                0
              }
              onEdit={
                handleOpenWalletBalance
              }
              onTransfer={
                handleOpenWalletTransfer
              }
            />
          </div>

          <div
            className="
              mx-auto
              w-full
              max-w-[520px]
              sm:pt-[185px]
              lg:pt-0
            "
          >
            <SavingsSummary
              balance={
                summary
                  .savings ||
                0
              }
            />
          </div>
        </section>

        {/* =================================================
            CARDS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-2
            gap-x-3
            gap-y-5
            sm:grid-cols-3
            sm:gap-5
            lg:grid-cols-4
            xl:gap-x-6
            xl:gap-y-7
          "
        >
          <AnimatePresence
            mode="popLayout"
          >
            {cards.map(
              (
                account,
              ) => (
                <SavingsCard
                  key={
                    account.id
                  }
                  account={
                    account
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

          {Array.from({
            length:
              emptySlots,
          }).map(
            (
              _,
              index,
            ) => {
              if (
                index ===
                  0 &&
                canAddCard
              ) {
                return (
                  <AddCardSlot
                    key={`empty-${index}`}
                    onClick={
                      handleOpenAdd
                    }
                  />
                );
              }

              return (
                <EmptyCardSlot
                  key={`empty-${index}`}
                />
              );
            },
          )}
        </section>
      </main>

      {/* ===================================================
          ADD CARD
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
          WALLET BALANCE
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
          TRANSFER
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