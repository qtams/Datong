import { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import {
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  LoaderCircle,
  WalletCards,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import ModalShell from "./ModalShell";

import datongWallet from "../../assets/datong_wallet.webp";

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

function normalizeMoneyInput(value) {
  let cleaned = String(value || "").replace(/[^\d.]/g, "");

  const parts = cleaned.split(".");

  if (parts.length > 2) {
    cleaned = `${parts.shift()}.${parts.join("")}`;
  }

  if (cleaned.includes(".")) {
    const [whole, decimal = ""] = cleaned.split(".");

    cleaned = `${whole}.${decimal.slice(0, 2)}`;
  }

  return cleaned;
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

/* =========================================================
   ACCOUNT OPTION
========================================================= */

function AccountOption({
  account,
  selected,
  disabled = false,
  fixed = false,
  balanceOverride = null,
  invalid = false,
  onClick,
}) {
  if (!account) {
    return null;
  }

  const isCash = account?.type === "cash";

  const cardImage = isCash ? datongWallet : account?.image || "";

  const shownBalance = balanceOverride ?? account?.balance ?? 0;

  const maskStyle = cardImage
    ? {
        WebkitMaskImage: `url("${cardImage}")`,

        maskImage: `url("${cardImage}")`,

        WebkitMaskSize: isCash ? "contain" : "cover",

        maskSize: isCash ? "contain" : "cover",

        WebkitMaskRepeat: "no-repeat",

        maskRepeat: "no-repeat",

        WebkitMaskPosition: "center",

        maskPosition: "center",
      }
    : {};

  return (
    <button
      type="button"
      disabled={disabled}
      tabIndex={fixed ? -1 : undefined}
      onClick={() => {
        if (!fixed) {
          onClick?.(account);
        }
      }}
      aria-pressed={fixed ? undefined : selected}
      aria-label={`${account?.name || "Account"}, ${formatPeso(
        account?.balance,
      )}`}
      title={account?.name || "Account"}
      className={`
        group

        relative

        w-full
        shrink-0

        rounded-[14px]

        text-left

        outline-none

        transition-all
        duration-150

        focus-visible:ring-2
        focus-visible:ring-black/40
        focus-visible:ring-offset-2

        ${fixed ? "cursor-default" : ""}

        ${
          disabled
            ? "cursor-not-allowed opacity-30 grayscale"
            : selected
              ? "opacity-100"
              : "opacity-100 hover:opacity-90 active:scale-[0.98]"
        }
      `}
      style={{
        aspectRatio: "1.586 / 1",
      }}
    >
      {/* =================================================
          ART
      ================================================= */}

      {cardImage ? (
        <img
          src={cardImage}
          alt=""
          draggable={false}
          className={`
            absolute
            inset-0

            h-full
            w-full

            select-none

            ${isCash ? "object-contain" : "rounded-[14px] object-cover"}
          `}
        />
      ) : (
        <div
          className="
            absolute
            inset-0

            overflow-hidden

            rounded-[14px]

            bg-gradient-to-br
            from-gray-800
            via-gray-900
            to-black

            text-white
          "
        >
          {isCash ? (
            <Banknote
              size={18}
              strokeWidth={1.4}
              className="
                absolute
                left-[8%]
                top-[12%]

                text-white/80
              "
            />
          ) : (
            <WalletCards
              size={18}
              strokeWidth={1.4}
              className="
                absolute
                left-[8%]
                top-[12%]

                text-white/80
              "
            />
          )}
        </div>
      )}

      {/* =================================================
          GRADIENT
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0

          rounded-[14px]
        "
        style={{
          ...maskStyle,

          backgroundImage:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 32%, rgba(0,0,0,0) 58%)",
        }}
      />

      {/* =================================================
          NAME + BALANCE
      ================================================= */}

      <div
        className={`
          pointer-events-none

          absolute

          bottom-[8%]
          right-[7%]

          z-10

          sm:bottom-[10%]

          ${isCash ? "left-[14%]" : "left-[7%]"}
        `}
      >
        <p
          style={CARD_TEXT_STYLE}
          className="
            truncate

            text-[8px]
            font-normal
            uppercase
            leading-none
            tracking-[0.1em]

            text-white

            sm:text-[11px]
            sm:leading-normal
            sm:tracking-[0.12em]
          "
        >
          {account?.name || "Account"}
        </p>

        <motion.p
          key={String(shownBalance)}
          initial={{
            opacity: 0.4,
            y: 3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.12,
          }}
          style={
            invalid
              ? {
                  ...CARD_TEXT_STYLE,
                  color: "#fca5a5",
                }
              : CARD_TEXT_STYLE
          }
          className="
            mt-1

            truncate

            text-[10px]
            font-normal
            leading-none
            tracking-[0.06em]

            text-white

            sm:mt-1.5
            sm:text-[15px]
            sm:leading-normal
          "
        >
          {formatPeso(shownBalance)}
        </motion.p>
      </div>
    </button>
  );
}

/* =========================================================
   CARD PICKER ITEM

   IMAGE ONLY
   NO SHADOW
   NO BORDER
   NO CONTAINER
   NO OVERLAY
========================================================= */

function CardPickerItem({ account, selected = false, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{
        scale: 0.98,
      }}
      onClick={() => {
        onClick?.(account);
      }}
      aria-label={`Select ${account.name}`}
      aria-pressed={selected}
      className="
        relative

        block
        w-full

        border-0

        bg-transparent

        p-0

        text-left

        outline-none

        shadow-none

        appearance-none

        focus:outline-none
      "
      style={{
        aspectRatio: "1.586 / 1",

        boxShadow: "none",

        filter: "none",
      }}
    >
      {account.image ? (
        <img
          src={account.image}
          alt={account.name}
          draggable={false}
          className="
            block

            h-full
            w-full

            select-none

            object-cover

            shadow-none
          "
          style={{
            display: "block",

            boxShadow: "none",

            filter: "none",

            WebkitFilter: "none",
          }}
        />
      ) : (
        <div
          className="
            flex

            h-full
            w-full

            items-center
            justify-center

            bg-black

            text-white

            shadow-none
          "
          style={{
            boxShadow: "none",
          }}
        >
          <WalletCards size={20} strokeWidth={1.4} />
        </div>
      )}
    </motion.button>
  );
}

/* =========================================================
   EMPTY CARDS
========================================================= */

function EmptyCards() {
  return (
    <div
      className="
        flex

        min-h-[240px]

        flex-col
        items-center
        justify-center

        px-6

        text-center
      "
    >
      <div
        className="
          flex
          h-11
          w-11

          items-center
          justify-center

          rounded-full

          bg-gray-100

          text-gray-400
        "
      >
        <WalletCards size={19} strokeWidth={1.5} />
      </div>

      <p
        className="
          mt-3

          text-[11px]
          font-medium
          text-gray-700
        "
      >
        No savings cards
      </p>

      <p
        className="
          mt-1

          text-[9px]
          text-gray-400
        "
      >
        Add a savings card first.
      </p>
    </div>
  );
}

/* =========================================================
   DESTINATION CARD PICKER

   MOBILE
   -> Bottom sheet

   DESKTOP
   -> Separate centered modal
========================================================= */

function DestinationCardPicker({
  cards,
  selectedAccount,
  selectedBalanceOverride = null,
  open,
  onToggle,
  onClose,
  onSelect,
}) {
  const selectionModalRef = useRef(null);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();

      event.stopPropagation();

      event.stopImmediatePropagation();

      onClose?.();
    };

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open, onClose]);

  /* =======================================================
     LOCK BODY
  ======================================================= */

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return undefined;
    }

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* =======================================================
     CARD SELECTION MODAL
  ======================================================= */

  const selectionModal =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
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
                  duration: 0.15,
                }}
                className="
                  fixed
                  inset-0

                  z-[10050]

                  flex
                  items-end
                  justify-center

                  sm:items-center
                  sm:p-6
                "
              >
                {/* =========================================
                    BACKDROP
                ========================================= */}

                <motion.button
                  type="button"
                  aria-label="Close card selection"
                  onClick={onClose}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="
                    absolute
                    inset-0

                    cursor-default

                    border-0

                    bg-black/40

                    p-0

                    backdrop-blur-[2px]
                  "
                />

                {/* =========================================
                    MOBILE BOTTOM SHEET
                ========================================= */}

                <motion.div
                  ref={selectionModalRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Choose a card"
                  initial={{
                    y: "100%",
                  }}
                  animate={{
                    y: 0,
                  }}
                  exit={{
                    y: "100%",
                  }}
                  transition={{
                    type: "spring",

                    stiffness: 410,

                    damping: 38,

                    mass: 0.9,
                  }}
                  className="
                    relative

                    z-10

                    flex

                    max-h-[72dvh]

                    w-full

                    flex-col

                    overflow-hidden

                    rounded-t-[26px]

                    border-t
                    border-gray-200

                    bg-white

                    pb-[max(env(safe-area-inset-bottom),12px)]

                    shadow-[0_-24px_70px_rgba(0,0,0,0.18)]

                    sm:hidden
                  "
                >
                  {/* HANDLE */}

                  <div
                    className="
                      flex
                      h-8
                      shrink-0
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        h-1
                        w-10

                        rounded-full

                        bg-gray-300
                      "
                    />
                  </div>

                  {/* HEADER */}

                  <div
                    className="
                      flex
                      shrink-0
                      items-start
                      justify-between
                      gap-4

                      border-b
                      border-gray-100

                      px-5
                      pb-4
                      pt-1
                    "
                  >
                    <div
                      className="
                        min-w-0
                      "
                    >
                      <h3
                        className="
                          text-[15px]
                          font-semibold
                          tracking-[-0.02em]
                          text-gray-950
                        "
                      >
                        Choose a card
                      </h3>

                      <p
                        className="
                          mt-1

                          text-[9px]
                          leading-4
                          text-gray-400
                        "
                      >
                        Select where you want to transfer the money.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close card selection"
                      className="
                        flex
                        h-8
                        w-8

                        shrink-0

                        items-center
                        justify-center

                        rounded-full

                        bg-gray-100

                        text-gray-500

                        active:bg-gray-200
                      "
                    >
                      <X size={14} strokeWidth={1.7} />
                    </button>
                  </div>

                  {/* MOBILE SCROLL */}

                  <div
                    className="
                      min-h-0
                      flex-1

                      overflow-y-auto
                      overscroll-contain

                      px-4
                      py-4

                      [scrollbar-width:thin]

                      [-webkit-overflow-scrolling:touch]
                    "
                  >
                    {cards.length > 0 ? (
                      <div
                        className="
                          grid
                          grid-cols-2

                          items-start

                          gap-x-4
                          gap-y-4

                          pb-3
                        "
                      >
                        {cards.map((account) => (
                          <CardPickerItem
                            key={account.key}
                            account={account}
                            selected={selectedAccount?.key === account.key}
                            onClick={(selected) => {
                              onSelect?.(selected);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyCards />
                    )}
                  </div>
                </motion.div>

                {/* =========================================
                    DESKTOP MODAL
                ========================================= */}

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Choose a card"
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.17,

                    ease: "easeOut",
                  }}
                  className="
                    relative

                    z-10

                    hidden

                    w-full
                    max-w-[720px]

                    flex-col

                    overflow-hidden

                    rounded-[22px]

                    border
                    border-gray-200

                    bg-white

                    shadow-[0_30px_100px_rgba(0,0,0,0.25)]

                    sm:flex

                    max-h-[78vh]
                  "
                >
                  {/* DESKTOP HEADER */}

                  <div
                    className="
                      flex
                      shrink-0
                      items-start
                      justify-between
                      gap-4

                      border-b
                      border-gray-100

                      px-6
                      py-5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9

                          items-center
                          justify-center

                          rounded-xl

                          bg-black
                          text-white
                        "
                      >
                        <WalletCards size={15} strokeWidth={1.7} />
                      </div>

                      <div>
                        <h3
                          className="
                            text-[13px]
                            font-semibold
                            text-gray-950
                          "
                        >
                          Choose a card
                        </h3>

                        <p
                          className="
                            mt-0.5

                            text-[9px]
                            text-gray-400
                          "
                        >
                          Select where you want to transfer the money.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close card selection"
                      className="
                        flex
                        h-8
                        w-8

                        shrink-0

                        items-center
                        justify-center

                        rounded-lg

                        text-gray-400

                        transition-colors

                        hover:bg-gray-100
                        hover:text-black
                      "
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* DESKTOP CARD SCROLL */}

                  <div
                    className="
                      min-h-0
                      flex-1

                      overflow-y-auto
                      overscroll-contain

                      px-6
                      py-6

                      [scrollbar-width:thin]
                    "
                  >
                    {cards.length > 0 ? (
                      <div
                        className="
                          grid
                          grid-cols-2

                          items-start

                          gap-x-5
                          gap-y-5

                          lg:grid-cols-3
                        "
                      >
                        {cards.map((account) => (
                          <CardPickerItem
                            key={account.key}
                            account={account}
                            selected={selectedAccount?.key === account.key}
                            onClick={(selected) => {
                              onSelect?.(selected);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyCards />
                    )}
                  </div>

                  {/* DESKTOP FOOTER */}

                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      justify-between

                      border-t
                      border-gray-100

                      bg-gray-50/50

                      px-6
                      py-3
                    "
                  >
                    <p
                      className="
                        text-[8px]
                        text-gray-400
                      "
                    >
                      {cards.length} {cards.length === 1 ? "card" : "cards"}{" "}
                      available
                    </p>

                    <button
                      type="button"
                      onClick={onClose}
                      className="
                        h-9

                        rounded-lg

                        border
                        border-gray-200

                        bg-white

                        px-4

                        text-[9px]
                        font-medium
                        text-gray-600

                        hover:bg-gray-50
                      "
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      {/* =================================================
          DESTINATION FIELD
      ================================================= */}

      <div
        className="
          relative

          py-1.5
        "
      >
        {selectedAccount ? (
          <AccountOption
            account={selectedAccount}
            selected
            balanceOverride={selectedBalanceOverride}
            onClick={onToggle}
          />
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Choose destination card"
            title="Choose destination card"
            className="
              relative

              w-full

              rounded-[14px]

              border
              border-gray-300

              bg-gray-200/70

              outline-none

              transition-all

              hover:bg-gray-200

              active:scale-[0.98]

              focus-visible:ring-2
              focus-visible:ring-black/40
              focus-visible:ring-offset-2
            "
            style={{
              aspectRatio: "1.586 / 1",
            }}
          />
        )}
      </div>

      {selectionModal}
    </>
  );
}

/* =========================================================
   TRANSFER MONEY MODAL
========================================================= */

function TransferMoneyModal({
  open,
  cards = [],
  cashAccount,
  initialSource = null,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const [selectedCardKey, setSelectedCardKey] = useState("");

  const [destinationPickerOpen, setDestinationPickerOpen] = useState(false);

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const [error, setError] = useState("");

  /* =======================================================
     DIRECTION
  ======================================================= */

  const cashToCard = initialSource?.type === "cash";

  /* =======================================================
     FONT
  ======================================================= */

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (document.getElementById(CARD_FONT_ID)) {
      return;
    }

    const link = document.createElement("link");

    link.id = CARD_FONT_ID;

    link.rel = "stylesheet";

    link.href = CARD_FONT_URL;

    document.head.appendChild(link);
  }, []);

  /* =======================================================
     CARD ACCOUNTS
  ======================================================= */

  const cardAccounts = useMemo(
    () =>
      cards.map((card) => ({
        key: `card-${card.id}`,

        id: card.id,

        type: "card",

        name: card.name || card.provider?.name || "Savings",

        balance: card.balance || "0.00",

        image:
          card.provider?.landscape_image_url ||
          card.provider?.portrait_image_url ||
          "",
      })),
    [cards],
  );

  /* =======================================================
     WALLET ACCOUNT
  ======================================================= */

  const walletAccount = useMemo(
    () => ({
      key: "cash",

      id: cashAccount?.id ?? null,

      type: "cash",

      name: "Datong Wallet",

      balance: cashAccount?.balance || "0.00",

      image: "",
    }),
    [cashAccount?.id, cashAccount?.balance],
  );

  /* =======================================================
     RESET
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount("");

    setNote("");

    setError("");

    setDestinationPickerOpen(false);

    /* =====================================================
       WALLET -> CARD
       START BLANK
    ===================================================== */

    if (cashToCard) {
      setSelectedCardKey("");

      return;
    }

    /* =====================================================
       CARD -> WALLET
       USE CLICKED CARD
    ===================================================== */

    if (initialSource?.id) {
      setSelectedCardKey(`card-${initialSource.id}`);

      return;
    }

    setSelectedCardKey("");
  }, [open, cashToCard, initialSource?.id]);

  /* =======================================================
     SELECTED CARD
  ======================================================= */

  const selectedCardFromList =
    cardAccounts.find((account) => account.key === selectedCardKey) || null;

  /* =======================================================
     CARD -> WALLET FALLBACK
  ======================================================= */

  const clickedSourceFallback = useMemo(() => {
    if (cashToCard || !initialSource || !initialSource?.id) {
      return null;
    }

    return {
      key: `card-${initialSource.id}`,

      id: initialSource.id,

      type: "card",

      name: initialSource.name || initialSource.provider?.name || "Savings",

      balance: initialSource.balance || "0.00",

      image:
        initialSource.provider?.landscape_image_url ||
        initialSource.provider?.portrait_image_url ||
        "",
    };
  }, [cashToCard, initialSource]);

  const selectedCard = cashToCard
    ? selectedCardFromList
    : selectedCardFromList || clickedSourceFallback;

  /* =======================================================
     FROM / TO
  ======================================================= */

  const fromAccount = cashToCard ? walletAccount : selectedCard;

  const toAccount = cashToCard ? selectedCard : walletAccount;

  /* =======================================================
     SELECT DESTINATION CARD
  ======================================================= */

  const handleCardChange = (account) => {
    setSelectedCardKey(account.key);

    setDestinationPickerOpen(false);

    setError("");
  };

  /* =======================================================
     MAX
  ======================================================= */

  const handleMax = () => {
    const balance = Number(fromAccount?.balance || 0);

    if (balance <= 0) {
      return;
    }

    setAmount(balance.toFixed(2));

    setError("");
  };

  /* =======================================================
     PERCENT
  ======================================================= */

  const handlePercent = (percent) => {
    const balance = Number(fromAccount?.balance || 0);

    if (balance <= 0) {
      return;
    }

    setAmount((Math.floor(balance * percent) / 100).toFixed(2));

    setError("");
  };

  /* =======================================================
     PREVIEW
  ======================================================= */

  const numericPreview = Number(amount);

  const previewValid = Number.isFinite(numericPreview) && numericPreview > 0;

  const fromAfter = fromAccount
    ? Number(fromAccount.balance || 0) - (previewValid ? numericPreview : 0)
    : 0;

  const toAfter = toAccount
    ? Number(toAccount.balance || 0) + (previewValid ? numericPreview : 0)
    : 0;

  const overBalance = Boolean(fromAccount) && previewValid && fromAfter < 0;

  const hasBalance = Number(fromAccount?.balance || 0) > 0;

  const noCards = cardAccounts.length === 0;

  const canEnterAmount = !noCards && Boolean(fromAccount) && Boolean(toAccount);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (noCards) {
      setError("Add a savings card first.");

      return;
    }

    if (cashToCard && !selectedCard) {
      setError("Select the card you want to transfer money to.");

      setDestinationPickerOpen(true);

      return;
    }

    if (!fromAccount || !toAccount) {
      setError("Select an account.");

      return;
    }

    const numericAmount = Number(amount);

    const sourceBalance = Number(fromAccount.balance || 0);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid transfer amount.");

      return;
    }

    if (numericAmount > sourceBalance) {
      setError("Transfer amount is higher than the available balance.");

      return;
    }

    setError("");

    onSubmit?.({
      from_type: fromAccount.type,

      from_id: fromAccount.type === "card" ? fromAccount.id : null,

      to_type: toAccount.type,

      to_id: toAccount.type === "card" ? toAccount.id : null,

      amount,

      note: note.trim() || null,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <ModalShell
      mobileSheet
      size="max-w-[640px]"
      labelledBy="transfer-money-title"
      onClose={() => {
        if (destinationPickerOpen) {
          setDestinationPickerOpen(false);

          return;
        }

        if (!submitting) {
          onClose?.();
        }
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          sticky
          top-0
          z-30

          flex
          items-start
          justify-between

          border-b
          border-gray-100

          bg-white

          px-5
          py-3.5

          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-9
              w-9

              items-center
              justify-center

              rounded-xl

              bg-black
              text-white
            "
          >
            <ArrowLeftRight size={15} strokeWidth={1.8} />
          </div>

          <div>
            <h2
              id="transfer-money-title"
              className="
                text-[13px]
                font-semibold
                text-gray-950
              "
            >
              Transfer money
            </h2>

            <p
              className="
                mt-0.5

                text-[8px]
                text-gray-400
              "
            >
              {cashToCard
                ? "Move money from your wallet into a savings card."
                : "Move money from a savings card into your wallet."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          aria-label="Close"
          className="
            flex
            h-8
            w-8

            items-center
            justify-center

            rounded-lg

            text-gray-400

            hover:bg-gray-100
            hover:text-black

            disabled:opacity-50
          "
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="
            p-4

            sm:px-6
            sm:py-5
          "
        >
          {/* =================================================
              ACCOUNTS
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-center

              gap-2

              sm:gap-3
            "
          >
            {/* FROM */}

            <div
              className="
                min-w-0
                max-w-[300px]
                flex-1
              "
            >
              <div
                className="
                  py-1.5
                "
              >
                <AccountOption
                  account={cashToCard ? walletAccount : selectedCard}
                  selected
                  fixed
                  invalid={overBalance}
                  balanceOverride={previewValid ? fromAfter : null}
                />
              </div>
            </div>

            {/* ARROW */}

            <div
              className="
                flex
                shrink-0
                items-center
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7

                  items-center
                  justify-center

                  rounded-full

                  bg-gray-100

                  text-gray-500

                  sm:h-8
                  sm:w-8
                "
              >
                <ArrowRight size={13} />
              </div>
            </div>

            {/* TO */}

            <div
              className="
                min-w-0
                max-w-[300px]
                flex-1
              "
            >
              {cashToCard ? (
                <DestinationCardPicker
                  cards={cardAccounts}
                  selectedAccount={selectedCard}
                  selectedBalanceOverride={previewValid ? toAfter : null}
                  open={destinationPickerOpen}
                  onToggle={() => {
                    setDestinationPickerOpen((current) => !current);
                  }}
                  onClose={() => {
                    setDestinationPickerOpen(false);
                  }}
                  onSelect={handleCardChange}
                />
              ) : (
                <div
                  className="
                    py-1.5
                  "
                >
                  <AccountOption
                    account={walletAccount}
                    selected
                    fixed
                    balanceOverride={previewValid ? toAfter : null}
                  />
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              DIRECTION
          ================================================= */}

          <div
            className="
              mt-3

              flex
              justify-center
            "
          >
            <span
              className="
                rounded-full

                bg-gray-100

                px-3
                py-1

                text-[8px]
                font-medium
                text-gray-500
              "
            >
              {cashToCard ? "Wallet → Savings" : "Savings → Wallet"}
            </span>
          </div>

          {/* =================================================
              AMOUNT
          ================================================= */}

          <div
            className="
              mt-5
            "
          >
            <div
              className="
                mb-1.5

                flex
                items-center
                justify-between
              "
            >
              <label
                htmlFor="transfer-amount"
                className="
                  text-[10px]
                  font-medium
                  text-gray-700
                "
              >
                Amount
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                {fromAccount && (
                  <span
                    className="
                      text-[8px]
                      text-gray-400
                    "
                  >
                    Available {formatPeso(fromAccount.balance)}
                  </span>
                )}

                <button
                  type="button"
                  disabled={!hasBalance || !canEnterAmount}
                  onClick={handleMax}
                  className="
                    text-[8px]
                    font-semibold
                    text-gray-500

                    hover:text-black

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Use max
                </button>
              </div>
            </div>

            <div
              className="
                relative
              "
            >
              <span
                style={CARD_FONT_STYLE}
                className="
                  absolute
                  left-3.5
                  top-1/2

                  -translate-y-1/2

                  text-[18px]
                  text-gray-400
                "
              >
                ₱
              </span>

              <input
                id="transfer-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                disabled={!canEnterAmount}
                onChange={(event) => {
                  const next = normalizeMoneyInput(event.target.value);

                  const max = Number(fromAccount?.balance || 0);

                  if (next !== "" && Number(next) > max) {
                    setAmount(max > 0 ? max.toFixed(2) : "");

                    setError(
                      max > 0
                        ? `You can transfer up to ${formatPeso(max)}.`
                        : "This account has no available balance.",
                    );

                    return;
                  }

                  setAmount(next);

                  setError("");
                }}
                placeholder={
                  cashToCard && !selectedCard ? "Select a card first" : "0.00"
                }
                aria-invalid={Boolean(error)}
                style={CARD_FONT_STYLE}
                className={`
                  h-14
                  w-full

                  rounded-xl

                  border

                  bg-white

                  pl-10
                  pr-3

                  text-[22px]
                  tracking-[0.04em]
                  text-gray-950

                  outline-none

                  transition-colors

                  placeholder:text-gray-300

                  disabled:cursor-not-allowed
                  disabled:bg-gray-50

                  ${
                    error
                      ? "border-red-300"
                      : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  }
                `}
              />
            </div>

            {/* =================================================
                QUICK
            ================================================= */}

            <div
              className="
                mt-2

                flex
                items-center
                gap-1.5
              "
            >
              {[25, 50, 75].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  disabled={!hasBalance || !canEnterAmount}
                  onClick={() => handlePercent(percent)}
                  className="
                      h-7

                      rounded-full

                      border
                      border-gray-200

                      px-3

                      text-[8px]
                      font-medium
                      text-gray-500

                      hover:bg-gray-50
                      hover:text-black

                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                >
                  {percent}%
                </button>
              ))}

              <button
                type="button"
                disabled={!hasBalance || !canEnterAmount}
                onClick={handleMax}
                className="
                  h-7

                  rounded-full

                  border
                  border-gray-200

                  px-3

                  text-[8px]
                  font-medium
                  text-gray-500

                  hover:bg-gray-50
                  hover:text-black

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Max
              </button>
            </div>

            {error && (
              <p
                className="
                  mt-1.5

                  text-[9px]
                  text-red-500
                "
              >
                {error}
              </p>
            )}
          </div>

          {/* =================================================
              NOTE
          ================================================= */}

          <div
            className="
              mt-4
            "
          >
            <label
              htmlFor="transfer-note"
              className="
                mb-1.5
                block

                text-[10px]
                font-medium
                text-gray-700
              "
            >
              Note{" "}
              <span
                className="
                  text-gray-400
                "
              >
                (optional)
              </span>
            </label>

            <input
              id="transfer-note"
              value={note}
              maxLength={255}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                cashToCard
                  ? "Example: Move cash into savings"
                  : "Example: Withdraw for daily expenses"
              }
              className="
                h-10
                w-full

                rounded-lg

                border
                border-gray-200

                px-3

                text-[10px]

                outline-none

                placeholder:text-gray-400

                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-100
              "
            />
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            sticky
            bottom-0
            z-20

            flex
            items-center
            justify-end
            gap-2

            border-t
            border-gray-100

            bg-white/95

            px-5
            py-3

            backdrop-blur-md

            sm:px-6
          "
        >
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="
              h-9

              rounded-lg

              border
              border-gray-200

              px-3

              text-[9px]
              font-medium
              text-gray-600

              hover:bg-gray-50

              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              noCards ||
              !previewValid ||
              overBalance ||
              !fromAccount ||
              !toAccount
            }
            className="
              flex
              h-9
              min-w-[108px]

              items-center
              justify-center
              gap-1.5

              rounded-lg

              bg-black

              px-4

              text-[9px]
              font-medium
              text-white

              hover:opacity-90

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {submitting ? (
              <>
                <LoaderCircle size={12} className="animate-spin" />
                Moving...
              </>
            ) : (
              <>
                <ArrowLeftRight size={12} />
                Transfer
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default TransferMoneyModal;
