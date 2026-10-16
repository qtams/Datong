import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  LoaderCircle,
  WalletCards,
  X,
} from "lucide-react";

import { motion } from "motion/react";

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
   CREDIT CARD FONT

   Same font + id as the other card screens, so the
   stylesheet is only ever added once.
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

   Card-shaped tile. Image only (no border, no container,
   no shadow). Selected = check badge, others dim.

   `fixed` = non-interactive tile (the on-hand destination).
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
  const isCash = account.type === "cash";

  /*
   * Savings cards use their provider artwork.
   * The on-hand cash tile uses the Datong wallet image.
   */

  const cardImage = isCash
    ? datongWallet
    : account.type === "card"
      ? account.image
      : "";

  /* Live balance (typing in the amount updates this in real time) */

  const shownBalance = balanceOverride ?? account.balance;

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
      aria-label={`${account.name}, ${formatPeso(account.balance)}`}
      title={account.name}
      className={`
        group

        relative

        w-full
        shrink-0

        snap-start

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
              ? "scale-[1.02] opacity-100"
              : "opacity-60 hover:opacity-100 active:scale-[0.98]"
        }
      `}
      style={{
        aspectRatio: "1.586 / 1",
      }}
    >
      {/* ART */}

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
          {account.type === "cash" ? (
            <Banknote
              size={18}
              strokeWidth={1.4}
              className="absolute left-[8%] top-[12%] text-white/80"
            />
          ) : (
            <WalletCards
              size={18}
              strokeWidth={1.4}
              className="absolute left-[8%] top-[12%] text-white/80"
            />
          )}

          <div
            aria-hidden="true"
            className="
              absolute
              -right-6
              -top-6

              h-24
              w-24

              rounded-full

              bg-white/5
            "
          />
        </div>
      )}

      {/* READABILITY GRADIENT (masked to the card art) */}

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

      {/* NAME + BALANCE */}

      <div
        className={`
          pointer-events-none

          absolute

          bottom-[8%]
          right-[7%]

          sm:bottom-[10%]

          z-10

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
          {account.name}
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
            sm:tracking-[0.08em]
          "
        >
          {formatPeso(shownBalance)}
        </motion.p>
      </div>

      {/* SELECTED check badge removed (selected = full brightness, others dim) */}
    </button>
  );
}

/* =========================================================
   TRANSFER MONEY MODAL

   ONE direction only:

     Savings card  ->  On-hand cash

   (On-hand cash -> savings card is not allowed.)
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
  const [fromKey, setFromKey] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const [error, setError] = useState("");

  /* =======================================================
     CARD FONT
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
     SOURCES (savings cards only)
  ======================================================= */

  const sources = useMemo(
    () =>
      cards.map((card) => ({
        key: `card-${card.id}`,

        id: card.id,

        type: "card",

        name: card.name,

        subtitle: card.provider?.name || "Savings",

        balance: card.balance || "0.00",

        image: card.provider?.landscape_image_url || "",
      })),
    [cards],
  );

  /* =======================================================
     DESTINATION (on-hand cash, fixed)
  ======================================================= */

  const destination = useMemo(
    () => ({
      key: "cash",

      id: cashAccount?.id || null,

      type: "cash",

      name: cashAccount?.name || "On-hand Cash",

      subtitle: "Actual Money",

      balance: cashAccount?.balance || "0.00",

      image: "",
    }),
    [cashAccount],
  );

  /* =======================================================
     INITIALIZE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount("");

    setNote("");

    setError("");

    let sourceKey = "";

    /*
     * Only a savings card can be the source.
     * If the modal was opened with anything else,
     * fall back to the first card that has money.
     */

    if (initialSource?.id && initialSource?.type !== "cash") {
      sourceKey = `card-${initialSource.id}`;
    }

    if (!sourceKey || !sources.some((account) => account.key === sourceKey)) {
      sourceKey =
        sources.find((account) => Number(account.balance) > 0)?.key ||
        sources[0]?.key ||
        "";
    }

    setFromKey(sourceKey);
  }, [open, initialSource, sources]);

  /* =======================================================
     CURRENT SOURCE
  ======================================================= */

  const fromAccount =
    sources.find((account) => account.key === fromKey) || null;

  const toAccount = destination;

  /* =======================================================
     CHANGE SOURCE
  ======================================================= */

  const handleFromChange = (account) => {
    setFromKey(account.key);

    setError("");

    /*
     * Never keep an amount that is higher than the
     * newly selected card can afford.
     */

    const nextBalance = Number(account.balance || 0);

    if (amount !== "" && Number(amount) > nextBalance) {
      setAmount(nextBalance > 0 ? nextBalance.toFixed(2) : "");
    }
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
     QUICK PERCENT
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
     SUBMIT
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!fromAccount) {
      setError("Select a savings card.");

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
      from_type: "card",

      from_id: fromAccount.id,

      to_type: "cash",

      to_id: null,

      amount,

      note: note.trim() || null,
    });
  };

  /* =======================================================
     PREVIEW NUMBERS
  ======================================================= */

  const numericPreview = Number(amount);

  const previewValid = Number.isFinite(numericPreview) && numericPreview > 0;

  const fromAfter = fromAccount
    ? Number(fromAccount.balance || 0) - (previewValid ? numericPreview : 0)
    : 0;

  const toAfter =
    Number(toAccount.balance || 0) + (previewValid ? numericPreview : 0);

  const overBalance = Boolean(fromAccount) && previewValid && fromAfter < 0;

  const hasBalance = Number(fromAccount?.balance || 0) > 0;

  const noCards = sources.length === 0;

  if (!open) {
    return null;
  }

  return (
    <ModalShell
      mobileSheet
      size="max-w-[640px]"
      labelledBy="transfer-money-title"
      onClose={() => {
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
              Move money from your savings to your on-hand cash.
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
              FROM  ->  TO   (side by side, no labels)

              Both cards fill their half and update in real
              time while typing: the savings card goes down,
              on-hand goes up.
          ================================================= */}

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* FROM (savings cards only) */}

            <div
              role="group"
              aria-label="From savings card"
              className="min-w-0 max-w-[300px] flex-1"
            >
              {noCards ? (
                <div
                  className="
                    rounded-xl

                    border
                    border-dashed
                    border-gray-300

                    px-5
                    py-8

                    text-center
                  "
                >
                  <WalletCards size={20} className="mx-auto text-gray-300" />

                  <p
                    className="
                      mt-3
                      text-[10px]
                      font-medium
                      text-gray-500
                    "
                  >
                    No savings cards yet
                  </p>

                  <p
                    className="
                      mt-1
                      text-[8px]
                      text-gray-400
                    "
                  >
                    Add a savings card first to transfer money.
                  </p>
                </div>
              ) : (
                <div
                  className="
                    -mx-1

                    flex
                    gap-3

                    snap-x
                    snap-mandatory

                    overflow-x-auto
                    overscroll-x-contain

                    px-1
                    py-1.5

                    [scrollbar-width:none]
                    [&::-webkit-scrollbar]:hidden
                  "
                >
                  {sources.map((account) => {
                    const isSelected = fromKey === account.key;

                    return (
                      <AccountOption
                        key={account.key}
                        account={account}
                        selected={isSelected}
                        balanceOverride={
                          isSelected && previewValid ? fromAfter : null
                        }
                        invalid={isSelected && overBalance}
                        onClick={handleFromChange}
                      />
                    );
                  })}
                </div>
              )}
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

            {/* TO (on-hand cash, fixed) */}

            <div
              role="group"
              aria-label="To on-hand cash"
              className="min-w-0 max-w-[300px] flex-1"
            >
              <div className="py-1.5">
                <AccountOption
                  account={toAccount}
                  selected
                  fixed
                  balanceOverride={previewValid ? toAfter : null}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              AMOUNT
          ================================================= */}

          <div className="mt-5">
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

              <div className="flex items-center gap-3">
                {fromAccount && (
                  <span className="text-[8px] text-gray-400">
                    Available {formatPeso(fromAccount.balance)}
                  </span>
                )}

                <button
                  type="button"
                  disabled={!fromAccount || !hasBalance}
                  onClick={handleMax}
                  className="
                    text-[8px]
                    font-semibold
                    text-gray-500

                    hover:text-black

                    disabled:opacity-40
                  "
                >
                  Use max
                </button>
              </div>
            </div>

            <div className="relative">
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
                disabled={noCards}
                onChange={(event) => {
                  const next = normalizeMoneyInput(event.target.value);

                  const max = Number(fromAccount?.balance || 0);

                  /*
                   * VALIDATION: the amount can never exceed the
                   * selected savings card's balance.
                   */

                  if (next !== "" && Number(next) > max) {
                    setAmount(max > 0 ? max.toFixed(2) : "");

                    setError(
                      max > 0
                        ? `You can transfer up to ${formatPeso(max)}.`
                        : "This card has no available balance.",
                    );

                    return;
                  }

                  setAmount(next);

                  setError("");
                }}
                placeholder="0.00"
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

                  disabled:bg-gray-50

                  ${
                    error
                      ? "border-red-300"
                      : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  }
                `}
              />
            </div>

            {/* QUICK AMOUNTS */}

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
                  disabled={!fromAccount || !hasBalance}
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

                    transition-colors

                    hover:border-gray-300
                    hover:bg-gray-50
                    hover:text-black

                    disabled:opacity-40
                  "
                >
                  {percent}%
                </button>
              ))}

              <button
                type="button"
                disabled={!fromAccount || !hasBalance}
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

                  transition-colors

                  hover:border-gray-300
                  hover:bg-gray-50
                  hover:text-black

                  disabled:opacity-40
                "
              >
                Max
              </button>
            </div>

            <div aria-live="polite">
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
          </div>

          {/* NOTE */}

          <div className="mt-4">
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
              Note <span className="text-gray-400">(optional)</span>
            </label>

            <input
              id="transfer-note"
              value={note}
              maxLength={255}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Example: Withdraw for daily expenses"
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

          {/* PREVIEW removed — the cards above update live. */}
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
            disabled={submitting || noCards || !previewValid || overBalance}
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

              transition-opacity

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
