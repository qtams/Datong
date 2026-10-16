import { useEffect, useState } from "react";

import { Banknote, LoaderCircle, Plus, X } from "lucide-react";

import ModalShell from "./ModalShell";

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
   NORMALIZE MONEY
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
   WALLET BALANCE MODAL
========================================================= */

function WalletBalanceModal({
  open,
  cashAccount,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const [amount, setAmount] = useState("");

  const [error, setError] = useState("");

  /* =======================================================
     INITIAL VALUE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const balance = Number(cashAccount?.balance || 0);

    setAmount(Number.isFinite(balance) ? balance.toFixed(2) : "0.00");

    setError("");
  }, [open, cashAccount?.balance]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      setError("Enter a valid wallet balance.");

      return;
    }

    if (numericAmount < 0) {
      setError("Wallet balance cannot be negative.");

      return;
    }

    if (numericAmount > 9999999999999.99) {
      setError("Wallet balance is too large.");

      return;
    }

    setError("");

    onSubmit?.({
      amount: numericAmount.toFixed(2),
    });
  };

  if (!open) {
    return null;
  }

  return (
    <ModalShell
      mobileSheet
      size="max-w-[430px]"
      labelledBy="wallet-balance-title"
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
          flex
          items-start
          justify-between

          border-b
          border-gray-100

          px-5
          py-4

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
            <Banknote size={15} strokeWidth={1.8} />
          </div>

          <div>
            <h2
              id="wallet-balance-title"
              className="
                text-[13px]
                font-semibold
                text-gray-950
              "
            >
              Wallet balance
            </h2>

            <p
              className="
                mt-0.5
                text-[9px]
                text-gray-400
              "
            >
              Enter your actual on-hand money.
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

            transition-colors

            hover:bg-gray-100
            hover:text-black

            disabled:opacity-50
          "
        >
          <X size={15} />
        </button>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <form onSubmit={handleSubmit}>
        <div
          className="
            px-5
            py-5

            sm:px-6
          "
        >
          {/* CURRENT */}

          <div
            className="
              rounded-xl

              bg-gray-50

              px-4
              py-3
            "
          >
            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Current wallet
            </p>

            <p
              className="
                mt-1

                text-[18px]
                font-semibold
                tracking-[-0.02em]
                text-gray-950
              "
            >
              {formatPeso(cashAccount?.balance || 0)}
            </p>
          </div>

          {/* AMOUNT */}

          <div className="mt-5">
            <label
              htmlFor="wallet-balance"
              className="
                mb-1.5
                block

                text-[10px]
                font-medium
                text-gray-700
              "
            >
              Actual money
            </label>

            <div className="relative">
              <span
                className="
                  absolute
                  left-4
                  top-1/2

                  -translate-y-1/2

                  text-[20px]
                  text-gray-400
                "
              >
                ₱
              </span>

              <input
                id="wallet-balance"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                autoFocus
                value={amount}
                disabled={submitting}
                onChange={(event) => {
                  setAmount(normalizeMoneyInput(event.target.value));

                  setError("");
                }}
                placeholder="0.00"
                aria-invalid={Boolean(error)}
                className={`
                  h-14
                  w-full

                  rounded-xl

                  border

                  bg-white

                  pl-10
                  pr-4

                  text-[22px]
                  font-medium
                  tracking-[-0.02em]
                  text-gray-950

                  outline-none

                  transition-all

                  placeholder:text-gray-300

                  disabled:bg-gray-50

                  ${
                    error
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  }
                `}
              />
            </div>

            <p
              className="
                mt-2

                text-[9px]
                leading-4
                text-gray-400
              "
            >
              This sets your wallet to the amount entered. It does not add the
              amount on top of the current balance.
            </p>

            {error && (
              <p
                className="
                  mt-2
                  text-[9px]
                  text-red-500
                "
              >
                {error}
              </p>
            )}
          </div>

          {/* QUICK */}

          <div
            className="
              mt-4

              grid
              grid-cols-4
              gap-2
            "
          >
            {[0, 500, 1000, 5000].map((value) => (
              <button
                key={value}
                type="button"
                disabled={submitting}
                onClick={() => {
                  setAmount(value.toFixed(2));

                  setError("");
                }}
                className="
                  h-9

                  rounded-lg

                  border
                  border-gray-200

                  bg-white

                  text-[9px]
                  font-medium
                  text-gray-600

                  transition-colors

                  hover:border-gray-300
                  hover:bg-gray-50
                  hover:text-black

                  disabled:opacity-50
                "
              >
                {value === 0 ? "₱0" : `₱${value.toLocaleString("en-PH")}`}
              </button>
            ))}
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-2

            border-t
            border-gray-100

            bg-white

            px-5
            py-3

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

              px-4

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
            disabled={submitting || amount === ""}
            className="
              flex
              h-9
              min-w-[118px]

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
                Saving...
              </>
            ) : (
              <>
                <Plus size={12} />
                Save balance
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default WalletBalanceModal;
