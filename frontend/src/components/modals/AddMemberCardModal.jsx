import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  LoaderCircle,
  Plus,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import ModalShell from "./ModalShell";

/* =========================================================
   MONEY
========================================================= */

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
   PESO
========================================================= */

function formatPeso(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",

    currency: "PHP",

    minimumFractionDigits: 0,

    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/* =========================================================
   GET EXISTING PROVIDER ID
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
   PROVIDER CARD

   Actual card artwork only.
========================================================= */

function ProviderCard({ provider, selected, onSelect }) {
  const image =
    provider.landscape_image_url || provider.portrait_image_url || "";

  return (
    <button
      type="button"
      onClick={() => onSelect(provider)}
      aria-label={provider.name}
      aria-pressed={selected}
      title={provider.name}
      className={`
        group
        relative

        rounded-xl

        text-left

        outline-none

        transition-all
        duration-150

        focus-visible:ring-2
        focus-visible:ring-black/30

        active:scale-[0.98]

        ${
          selected
            ? "scale-[1.03] drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]"
            : "hover:scale-[1.02] hover:drop-shadow-[0_6px_12px_rgba(0,0,0,0.14)]"
        }
      `}
    >
      <div
        className="
          relative

          aspect-[1.586/1]

          overflow-hidden

          rounded-xl
        "
      >
        {image ? (
          <img
            src={image}
            alt={provider.name}
            draggable={false}
            className="
              h-full
              w-full

              object-cover
            "
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
            "
          >
            <WalletCards size={22} strokeWidth={1.4} />
          </div>
        )}

        {/* =================================================
            SELECTED
        ================================================= */}

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.6,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.6,
              }}
              transition={{
                duration: 0.14,
              }}
              className="
                absolute
                right-2
                top-2

                flex
                h-6
                w-6
                items-center
                justify-center

                rounded-full

                bg-black
                text-white

                shadow-md

                ring-2
                ring-white
              "
            >
              <Check size={12} strokeWidth={2.4} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

/* =========================================================
   CREDIT CARD FONT
========================================================= */

const CARD_FONT_ID = "member-card-font";

const CARD_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap";

const CARD_TEXT_STYLE = {
  fontFamily:
    '"Share Tech Mono", "OCR A Std", "OCR-A", "Courier New", ui-monospace, monospace',

  fontVariantNumeric: "tabular-nums",

  textShadow:
    "0 1px 0 rgba(255,255,255,0.28), 0 -1px 0 rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)",
};

/* =========================================================
   LIVE CARD PREVIEW
========================================================= */

function LiveCardPreview({ provider, name, amount }) {
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

  const image =
    provider?.landscape_image_url || provider?.portrait_image_url || "";

  const displayName = name.trim() || "Card name";

  const displayAmount = formatPeso(amount || 0);

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[430px]
      "
    >
      {/* =================================================
          LIVE LABEL
      ================================================= */}

      <div
        className="
          mb-2

          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div>
          <p
            className="
              text-[9px]
              font-semibold
              text-gray-800
            "
          >
            Live preview
          </p>

          <p
            className="
              mt-0.5

              text-[8px]
              text-gray-400
            "
          >
            Updates while you type.
          </p>
        </div>

        <span
          className="
            rounded-full

            bg-emerald-50

            px-2
            py-1

            text-[7px]
            font-medium
            text-emerald-600
          "
        >
          LIVE
        </span>
      </div>

      {/* =================================================
          CARD
      ================================================= */}

      <motion.div
        layout
        className="
          relative

          aspect-[1.586/1]

          w-full
        "
      >
        {/* CARD ART */}

        {image ? (
          <img
            src={image}
            alt={provider?.name || "Card preview"}
            draggable={false}
            className="
              absolute
              inset-0

              h-full
              w-full

              object-contain
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
            <WalletCards size={32} strokeWidth={1.4} />
          </div>
        )}

        {/* =================================================
            READABILITY GRADIENT
        ================================================= */}

        <div
          className="
            pointer-events-none

            absolute
            inset-0
          "
          style={
            image
              ? {
                  backgroundImage:
                    "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 24%, rgba(0,0,0,0) 48%)",

                  WebkitMaskImage: `url("${image}")`,

                  maskImage: `url("${image}")`,

                  WebkitMaskSize: "contain",

                  WebkitMaskPosition: "center",

                  maskSize: "contain",

                  maskPosition: "center",

                  WebkitMaskRepeat: "no-repeat",

                  maskRepeat: "no-repeat",
                }
              : {
                  backgroundImage:
                    "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 24%, rgba(0,0,0,0) 48%)",
                }
          }
        />

        {/* =================================================
            LIVE NAME + AMOUNT
        ================================================= */}

        <div
          className="
            absolute

            bottom-[15%]
            left-[6%]

            z-10

            max-w-[80%]
          "
        >
          <AnimatePresence mode="popLayout">
            <motion.p
              key={displayName}
              initial={{
                opacity: 0,
                y: 4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.12,
              }}
              style={CARD_TEXT_STYLE}
              className="
                truncate

                text-[14px]
                font-normal
                uppercase
                tracking-[0.12em]
                text-white

                sm:text-[16px]
              "
            >
              {displayName}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            <motion.p
              key={displayAmount}
              initial={{
                opacity: 0,
                y: 4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.12,
              }}
              style={CARD_TEXT_STYLE}
              className="
                mt-1.5

                text-[17px]
                font-normal
                tracking-[0.1em]
                text-white

                sm:text-[20px]
              "
            >
              {displayAmount}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <div
        className="
          mt-2

          flex
          items-center
          justify-between
          gap-3
        "
      >
        <p
          className="
            truncate

            text-[8px]
            text-gray-400
          "
        >
          {provider?.name || "Selected provider"}
        </p>

        <p
          className="
            shrink-0

            text-[8px]
            text-gray-400
          "
        >
          Savings card
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressHeader({ currentStep }) {
  return (
    <div
      className="
        border-b
        border-gray-100

        bg-white

        px-5
        py-2.5

        sm:px-6
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div>
          <p
            className="
              text-[9px]
              font-semibold
              text-gray-900
            "
          >
            Step {currentStep} of 2
          </p>

          <p
            className="
              mt-0.5

              text-[8px]
              text-gray-400
            "
          >
            {currentStep === 1
              ? "Choose your savings card."
              : "Set the card name and balance."}
          </p>
        </div>

        <span
          className="
            rounded-full

            bg-gray-100

            px-2
            py-1

            text-[7px]
            font-medium
            text-gray-500
          "
        >
          {currentStep === 1 ? "Provider" : "Details"}
        </span>
      </div>

      <div
        className="
          mt-2.5

          h-[3px]

          overflow-hidden

          rounded-full

          bg-gray-100
        "
      >
        <motion.div
          initial={false}
          animate={{
            width: currentStep === 1 ? "50%" : "100%",
          }}
          transition={{
            duration: 0.25,
          }}
          className="
            h-full
            bg-black
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   ADD MEMBER CARD
========================================================= */

function AddMemberCardModal({
  open,

  catalog = [],

  existingCards = [],

  onClose,

  onSubmit,

  submitting = false,
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const [providerId, setProviderId] = useState(null);

  const [name, setName] = useState("");

  const [amount, setAmount] = useState("");

  const [search, setSearch] = useState("");

  const [errors, setErrors] = useState({});

  /* =======================================================
     RESET
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentStep(1);

    setProviderId(null);

    setName("");

    setAmount("");

    setSearch("");

    setErrors({});
  }, [open]);

  /* =======================================================
     EXISTING PROVIDER IDS

     Example:

     Existing member card:
     GCash provider id = 3

     Provider id 3 is removed from the Add Card list.
  ======================================================= */

  const existingProviderIds = useMemo(() => {
    const ids = existingCards
      .map((account) => getAccountProviderId(account))
      .filter((id) => id !== null);

    return new Set(ids);
  }, [existingCards]);

  /* =======================================================
     AVAILABLE CATALOG

     ONLY providers not yet added by this member.
  ======================================================= */

  const availableCatalog = useMemo(
    () =>
      catalog.filter(
        (provider) => !existingProviderIds.has(Number(provider.id)),
      ),
    [catalog, existingProviderIds],
  );

  /* =======================================================
     SELECTED PROVIDER
  ======================================================= */

  const selectedProvider = useMemo(
    () =>
      availableCatalog.find((item) => Number(item.id) === Number(providerId)) ||
      null,
    [availableCatalog, providerId],
  );

  /* =======================================================
     SEARCH FILTER

     Search happens AFTER removing already-owned cards.
  ======================================================= */

  const filteredCatalog = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return availableCatalog;
    }

    return availableCatalog.filter((provider) =>
      String(provider.name || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [availableCatalog, search]);

  /* =======================================================
     SELECT PROVIDER
  ======================================================= */

  const handleSelectProvider = (provider) => {
    setProviderId(provider.id);

    setName(provider.name || "");

    setErrors((current) => ({
      ...current,

      provider: "",
    }));
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    if (!providerId) {
      setErrors({
        provider: "Select a card provider.",
      });

      return;
    }

    setErrors({});

    setCurrentStep(2);
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (currentStep === 1) {
      handleNext();

      return;
    }

    const nextErrors = {};

    if (!providerId) {
      nextErrors.provider = "Select a card provider.";
    }

    if (!name.trim()) {
      nextErrors.name = "Card name is required.";
    }

    const parsedAmount = Number(amount);

    if (amount === "" || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      nextErrors.amount = "Enter a valid amount.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);

      return;
    }

    onSubmit?.({
      card_id: Number(providerId),

      name: name.trim(),

      amount: amount || "0",
    });
  };

  if (!open) {
    return null;
  }

  return (
    <ModalShell
      mobileSheet
      size="max-w-[620px]"
      labelledBy="add-member-card-title"
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
          py-3

          sm:px-6
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-xl

              bg-black
              text-white
            "
          >
            <Plus size={15} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h2
              id="add-member-card-title"
              className="
                text-[13px]
                font-semibold
                text-gray-950
              "
            >
              Add savings card
            </h2>

            <p
              className="
                mt-0.5

                text-[8px]
                text-gray-400
              "
            >
              Choose a card you have not added yet.
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
            hover:text-gray-900

            disabled:opacity-50
          "
        >
          <X size={15} />
        </button>
      </div>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <ProgressHeader currentStep={currentStep} />

      {/* =================================================
          FORM
      ================================================= */}

      <form onSubmit={handleSubmit}>
        <div
          className="
            p-4

            sm:px-6
            sm:py-4
          "
        >
          <AnimatePresence mode="wait" initial={false}>
            {/* =============================================
                STEP 1
            ============================================= */}

            {currentStep === 1 && (
              <motion.div
                key="provider"
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -10,
                }}
                transition={{
                  duration: 0.16,
                }}
              >
                {/* =========================================
                    TITLE
                ========================================= */}

                <div className="mb-3">
                  <h3
                    className="
                      text-[12px]
                      font-semibold
                      text-gray-950
                    "
                  >
                    Choose card
                  </h3>

                  <p
                    className="
                      mt-0.5

                      text-[8px]
                      text-gray-400
                    "
                  >
                    Cards you already added are automatically hidden.
                  </p>
                </div>

                {/* =========================================
                    SEARCH
                ========================================= */}

                {availableCatalog.length > 6 && (
                  <div
                    className="
                      relative
                      mb-3
                    "
                  >
                    <Search
                      size={13}
                      className="
                        pointer-events-none

                        absolute
                        left-3
                        top-1/2

                        -translate-y-1/2

                        text-gray-400
                      "
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search provider..."
                      className="
                        h-10
                        w-full

                        rounded-lg

                        border
                        border-gray-200

                        pl-9
                        pr-3

                        text-[10px]

                        outline-none

                        focus:border-gray-400
                        focus:ring-2
                        focus:ring-gray-100
                      "
                    />
                  </div>
                )}

                {/* =========================================
                    AVAILABLE PROVIDERS
                ========================================= */}

                {filteredCatalog.length > 0 ? (
                  <div
                    className="
                      grid

                      max-h-[48dvh]

                      grid-cols-2
                      content-start

                      gap-3

                      overflow-y-auto

                      overscroll-contain

                      p-2
                      pr-2.5

                      [scrollbar-color:#d1d5db_transparent]
                      [scrollbar-width:thin]

                      [&::-webkit-scrollbar]:w-1.5

                      [&::-webkit-scrollbar-track]:bg-transparent

                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb]:bg-gray-300

                      sm:max-h-[390px]
                      sm:grid-cols-3
                    "
                  >
                    {filteredCatalog.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        selected={Number(providerId) === Number(provider.id)}
                        onSelect={handleSelectProvider}
                      />
                    ))}
                  </div>
                ) : (
                  /* =======================================
                     EMPTY

                     This also handles the case where the
                     member already owns every provider.
                  ======================================= */

                  <div
                    className="
                      flex

                      min-h-[220px]

                      items-center
                      justify-center

                      rounded-xl

                      border
                      border-dashed
                      border-gray-200

                      px-5

                      text-center
                    "
                  >
                    <div>
                      <CreditCard
                        size={22}
                        className="
                          mx-auto
                          text-gray-300
                        "
                      />

                      <p
                        className="
                          mt-3

                          text-[10px]
                          font-semibold
                          text-gray-700
                        "
                      >
                        {availableCatalog.length === 0
                          ? "All cards added"
                          : "No cards found"}
                      </p>

                      <p
                        className="
                          mx-auto
                          mt-1

                          max-w-[220px]

                          text-[8px]
                          leading-4
                          text-gray-400
                        "
                      >
                        {availableCatalog.length === 0
                          ? "You already added every available savings card."
                          : "Try searching for another card provider."}
                      </p>
                    </div>
                  </div>
                )}

                {/* =========================================
                    ERROR
                ========================================= */}

                {errors.provider && (
                  <p
                    className="
                      mt-2

                      text-[9px]
                      text-red-500
                    "
                  >
                    {errors.provider}
                  </p>
                )}
              </motion.div>
            )}

            {/* =============================================
                STEP 2
            ============================================= */}

            {currentStep === 2 && (
              <motion.div
                key="details"
                initial={{
                  opacity: 0,
                  x: 10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 10,
                }}
                transition={{
                  duration: 0.16,
                }}
              >
                {/* =========================================
                    LIVE CARD
                ========================================= */}

                <LiveCardPreview
                  provider={selectedProvider}
                  name={name}
                  amount={amount}
                />

                {/* =========================================
                    CHANGE CARD
                ========================================= */}

                <div
                  className="
                    mt-3

                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-medium
                        text-gray-700
                      "
                    >
                      {selectedProvider?.name}
                    </p>

                    <p
                      className="
                        mt-0.5

                        text-[8px]
                        text-gray-400
                      "
                    >
                      Selected savings provider
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="
                      rounded-lg

                      border
                      border-gray-200

                      bg-white

                      px-3
                      py-1.5

                      text-[8px]
                      font-medium
                      text-gray-500

                      hover:bg-gray-50
                      hover:text-black
                    "
                  >
                    Change card
                  </button>
                </div>

                {/* =========================================
                    DIVIDER
                ========================================= */}

                <div
                  className="
                    my-4

                    h-px

                    bg-gray-100
                  "
                />

                {/* =========================================
                    CARD NAME
                ========================================= */}

                <div>
                  <label
                    htmlFor="member-card-name"
                    className="
                      mb-1.5
                      block

                      text-[10px]
                      font-medium
                      text-gray-700
                    "
                  >
                    Card name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="member-card-name"
                    value={name}
                    maxLength={100}
                    autoFocus
                    onChange={(event) => {
                      setName(event.target.value);

                      setErrors((current) => ({
                        ...current,

                        name: "",
                      }));
                    }}
                    placeholder="Example: Tamahome Buendia"
                    className={`
                      h-10
                      w-full

                      rounded-lg

                      border

                      bg-white

                      px-3

                      text-[10px]
                      text-gray-900

                      outline-none

                      placeholder:text-gray-400

                      ${
                        errors.name
                          ? "border-red-300"
                          : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                      }
                    `}
                  />

                  {errors.name && (
                    <p
                      className="
                        mt-1

                        text-[9px]
                        text-red-500
                      "
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* =========================================
                    BALANCE
                ========================================= */}

                <div className="mt-3">
                  <label
                    htmlFor="member-card-amount"
                    className="
                      mb-1.5
                      block

                      text-[10px]
                      font-medium
                      text-gray-700
                    "
                  >
                    Savings balance
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <span
                      className="
                        absolute

                        left-3
                        top-1/2

                        -translate-y-1/2

                        text-[12px]
                        font-semibold
                        text-gray-400
                      "
                    >
                      ₱
                    </span>

                    <input
                      id="member-card-amount"
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => {
                        setAmount(normalizeMoneyInput(event.target.value));

                        setErrors((current) => ({
                          ...current,

                          amount: "",
                        }));
                      }}
                      placeholder="0.00"
                      className={`
                        h-11
                        w-full

                        rounded-lg

                        border

                        bg-white

                        pl-8
                        pr-3

                        text-[14px]
                        font-semibold
                        text-gray-950

                        outline-none

                        placeholder:text-gray-300

                        ${
                          errors.amount
                            ? "border-red-300"
                            : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                        }
                      `}
                    />
                  </div>

                  <p
                    className="
                      mt-1

                      text-[8px]
                      text-gray-400
                    "
                  >
                    The balance above updates on the card preview in real time.
                  </p>

                  {errors.amount && (
                    <p
                      className="
                        mt-1

                        text-[9px]
                        text-red-500
                      "
                    >
                      {errors.amount}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            justify-between

            border-t
            border-gray-100

            bg-white/95

            px-5
            py-3

            backdrop-blur-md

            sm:px-6
          "
        >
          {/* =================================================
              BACK
          ================================================= */}

          <div>
            {currentStep === 2 && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => setCurrentStep(1)}
                className="
                  flex
                  h-9
                  items-center
                  gap-1.5

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
                <ArrowLeft size={12} />
                Back
              </button>
            )}
          </div>

          {/* =================================================
              CONTINUE
          ================================================= */}

          {currentStep === 1 ? (
            <button
              type="button"
              disabled={availableCatalog.length === 0}
              onClick={handleNext}
              className="
                flex
                h-9
                items-center
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
                disabled:opacity-30
              "
            >
              Continue
              <ArrowRight size={12} />
            </button>
          ) : (
            /* =============================================
               ADD CARD
            ============================================= */

            <button
              type="submit"
              disabled={submitting}
              className="
                flex
                h-9
                min-w-[105px]
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={12} />
                  Add card
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </ModalShell>
  );
}

export default AddMemberCardModal;
