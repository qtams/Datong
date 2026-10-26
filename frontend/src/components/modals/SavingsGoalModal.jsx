import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Coins,
  ImagePlus,
  Pencil,
  Target,
  Trash2,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import ModalShell from "./ModalShell";

import {
  getSavingsGoalIcon,
  SAVINGS_GOAL_ICONS,
} from "../../data/savingsGoalIcons";

const NAME_LIMIT = 25;

const CREATION_STEPS = [
  {
    id: "details",
    title: "Name your goal",
    description:
      "What are you saving for?",
  },
  {
    id: "starting-amount",
    title: "Starting amount",
    description:
      "Add money now or start from zero.",
  },
  {
    id: "target",
    title: "Saving target",
    description:
      "Set the amount you want to reach and an optional date.",
  },
];

const EMPTY_FORM = {
  name: "",
  iconId: "emergency",
  imageData: "",
  targetAmount: "",
  currentAmount: "",
  targetDate: "",
};

function createInitialForm(goal) {
  if (!goal) {
    return EMPTY_FORM;
  }

  return {
    name: String(goal.name || "").slice(
      0,
      NAME_LIMIT,
    ),
    iconId: goal.iconId || "emergency",
    imageData:
      typeof goal.imageData === "string" &&
      goal.imageData.startsWith("data:image/")
        ? goal.imageData
        : "",
    targetAmount: String(
      goal.targetAmount ?? "",
    ),
    currentAmount: String(
      goal.currentAmount ?? "",
    ),
    targetDate: goal.targetDate || "",
  };
}

function normalizeMoneyInput(value) {
  let cleaned = String(value || "").replace(
    /[^\d.]/g,
    "",
  );

  const parts = cleaned.split(".");

  if (parts.length > 2) {
    cleaned = `${parts.shift()}.${parts.join("")}`;
  }

  if (cleaned.includes(".")) {
    const [whole, decimals = ""] =
      cleaned.split(".");

    cleaned = `${whole}.${decimals.slice(0, 2)}`;
  }

  return cleaned;
}

function preventInvalidMoneyKey(event) {
  if (
    ["e", "E", "+", "-"].includes(
      event.key,
    )
  ) {
    event.preventDefault();
  }
}

function formatPeso(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(
    Number.isFinite(amount) ? amount : 0,
  );
}

function resizeGoalPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(
        new Error("Choose a valid image file."),
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      reject(
        new Error(
          "Choose an image smaller than 10 MB.",
        ),
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const side = Math.min(
        image.naturalWidth,
        image.naturalHeight,
      );

      const outputSize = Math.min(512, side);
      const canvas = document.createElement("canvas");

      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error("Unable to prepare this photo."),
        );
        return;
      }

      const sourceX =
        (image.naturalWidth - side) / 2;

      const sourceY =
        (image.naturalHeight - side) / 2;

      context.drawImage(
        image,
        sourceX,
        sourceY,
        side,
        side,
        0,
        0,
        outputSize,
        outputSize,
      );

      const imageData = canvas.toDataURL(
        "image/jpeg",
        0.86,
      );

      URL.revokeObjectURL(objectUrl);
      resolve(imageData);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error("Unable to read this photo."),
      );
    };

    image.src = objectUrl;
  });
}

function StepProgress({ currentStep }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Step ${currentStep + 1} of ${CREATION_STEPS.length}`}
    >
      {CREATION_STEPS.map((step, index) => (
        <span
          key={step.id}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            index === currentStep
              ? "w-6 bg-black"
              : index < currentStep
                ? "w-1.5 bg-gray-500"
                : "w-1.5 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function MoneyInput({
  id,
  value,
  onChange,
  placeholder,
  autoFocus = false,
  invalid = false,
  danger = false,
  describedBy,
}) {
  return (
    <div
      className={`mx-auto flex max-w-[430px] items-center justify-center border-b-2 px-2 pb-3 transition-colors ${
        invalid || danger
          ? "border-red-400"
          : "border-gray-200 focus-within:border-black"
      }`}
    >
      <span className="mr-2 text-[30px] font-semibold tracking-[-0.04em] text-gray-400 sm:text-[36px]">
        {"\u20B1"}
      </span>

      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={value}
        autoFocus={autoFocus}
        onKeyDown={preventInvalidMoneyKey}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`min-w-0 max-w-[300px] flex-1 bg-transparent text-center text-[38px] font-semibold tracking-[-0.055em] outline-none placeholder:text-gray-300 sm:text-[46px] ${
          invalid || danger
            ? "text-red-600"
            : "text-gray-950"
        }`}
      />
    </div>
  );
}

function SavingsGoalModal({
  open,
  goal = null,
  walletBalance = 0,
  walletLoading = false,
  walletError = "",
  saving = false,
  onClose,
  onSave,
  onDelete,
}) {
  const editing = Boolean(goal?.id);

  const [form, setForm] = useState(
    () => createInitialForm(goal),
  );

  const [currentStep, setCurrentStep] =
    useState(0);

  const [iconPickerOpen, setIconPickerOpen] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [uploadError, setUploadError] =
    useState("");

  const nameInputRef = useRef(null);

  const photoInputRef = useRef(null);

  const selectedIcon = useMemo(
    () => getSavingsGoalIcon(form.iconId),
    [form.iconId],
  );

  const SelectedIcon = selectedIcon.icon;

  const step = CREATION_STEPS[currentStep];

  const numericStartingAmount = Number(
    form.currentAmount || 0,
  );

  const normalizedWalletBalance = Math.max(
    0,
    Number(walletBalance || 0),
  );

  const startingAmountValid =
    Number.isFinite(numericStartingAmount) &&
    numericStartingAmount >= 0;

  const originalGoalAmount = editing
    ? Math.max(
        0,
        Number(goal?.currentAmount || 0),
      )
    : 0;

  const walletAmountChange =
    (startingAmountValid
      ? numericStartingAmount
      : 0) - originalGoalAmount;

  const walletBalanceAfter =
    normalizedWalletBalance -
    walletAmountChange;

  const walletBalanceReady =
    !walletLoading && !walletError;

  const overWalletBalance =
    walletBalanceReady &&
    startingAmountValid &&
    walletAmountChange >
      normalizedWalletBalance;

  const drainsWallet =
    walletBalanceReady &&
    startingAmountValid &&
    walletAmountChange > 0 &&
    walletBalanceAfter <= 0;

  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const handleMoneyChange = (
    field,
    value,
  ) => {
    const normalizedValue =
      normalizeMoneyInput(value);

    setField(field, normalizedValue);
  };

  const validateStep = (stepIndex) => {
    const nextErrors = {};

    if (stepIndex === 0) {
      if (!form.name.trim()) {
        nextErrors.name =
          "Enter what you are saving for.";
      }
    }

    if (stepIndex === 1) {
      const currentAmount = Number(
        form.currentAmount || 0,
      );

      if (
        !Number.isFinite(currentAmount) ||
        currentAmount < 0
      ) {
        nextErrors.currentAmount =
          "Enter a valid starting amount.";
      } else if (
        currentAmount > 0 &&
        walletLoading
      ) {
        nextErrors.currentAmount =
          "Wait for your wallet balance to load.";
      } else if (
        currentAmount > 0 &&
        walletError
      ) {
        nextErrors.currentAmount =
          "Your wallet balance is unavailable. Try again or skip this step.";
      } else if (
        currentAmount - originalGoalAmount >
        normalizedWalletBalance
      ) {
        nextErrors.currentAmount =
          "Starting amount cannot exceed your Datong Wallet balance.";
      }
    }

    if (stepIndex === 2) {
      const targetAmount = Number(
        form.targetAmount,
      );

      if (
        !Number.isFinite(targetAmount) ||
        targetAmount <= 0
      ) {
        nextErrors.targetAmount =
          "Enter a target greater than zero.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep((value) =>
      Math.min(
        value + 1,
        CREATION_STEPS.length - 1,
      ),
    );
  };

  const handleBack = () => {
    if (saving) {
      return;
    }

    if (iconPickerOpen) {
      setIconPickerOpen(false);
      return;
    }

    if (currentStep === 0) {
      onClose?.();
      return;
    }

    setErrors({});
    setCurrentStep((value) =>
      Math.max(0, value - 1),
    );
  };

  const handleSkipStartingAmount = () => {
    if (saving) {
      return;
    }

    setField("currentAmount", "");
    setCurrentStep(2);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError("");

    try {
      const imageData = await resizeGoalPhoto(
        file,
      );

      setField("imageData", imageData);
      setIconPickerOpen(false);
    } catch (error) {
      setUploadError(
        error?.message ||
          "Unable to upload this photo.",
      );
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (iconPickerOpen) {
      setIconPickerOpen(false);
      return;
    }

    if (
      currentStep <
      CREATION_STEPS.length - 1
    ) {
      handleNext();
      return;
    }

    if (!validateStep(2)) {
      return;
    }

    onSave?.({
      name: form.name.trim(),
      iconId: form.iconId,
      imageData: form.imageData || "",
      targetAmount: Number(
        form.targetAmount,
      ),
      currentAmount: Number(
        form.currentAmount || 0,
      ),
      targetDate: form.targetDate || "",
    });
  };

  if (!open) {
    return null;
  }

  return (
    <ModalShell
      mobileFullscreen
      size="max-w-[620px]"
      labelledBy="savings-goal-modal-title"
      onClose={saving ? undefined : onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="flex min-h-[100dvh] flex-col sm:min-h-0"
      >
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-5 pb-4 pt-4 backdrop-blur-md sm:px-6">
          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              aria-label={
                currentStep === 0 &&
                !iconPickerOpen
                  ? "Close savings goal"
                  : "Go back"
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
            >
              <ArrowLeft
                size={18}
                strokeWidth={1.8}
              />
            </button>

            <div className="pointer-events-none absolute inset-x-12 top-1/2 min-w-0 -translate-y-1/2 text-center">
              <h2
                id="savings-goal-modal-title"
                className="truncate text-[14px] font-semibold tracking-[-0.02em] text-gray-950"
              >
                {iconPickerOpen
                  ? "Choose an icon"
                  : editing
                    ? "Edit savings goal"
                    : "New savings goal"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close savings goal"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-black"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </div>

          {!iconPickerOpen && (
            <div className="mt-3 flex justify-center">
              <StepProgress
                currentStep={currentStep}
              />
            </div>
          )}
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {iconPickerOpen ? (
            <motion.div
              key="icon-picker"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ duration: 0.15 }}
              className="min-h-[calc(100dvh-73px)] px-5 pb-6 pt-5 sm:min-h-0 sm:px-6"
            >
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
                <p className="text-[13px] font-semibold text-gray-950">
                  Select an icon for your goal
                </p>

                <p className="mt-1 text-[9px] leading-4 text-gray-400">
                  Pick one that makes your goal easy to recognize.
                </p>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />

              <button
                type="button"
                onClick={() =>
                  photoInputRef.current?.click()
                }
                className="mt-4 flex h-14 w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 text-left transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                {form.imageData ? (
                  <img
                    src={form.imageData}
                    alt="Uploaded goal"
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <ImagePlus
                      size={16}
                      strokeWidth={1.7}
                    />
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-gray-950">
                    {form.imageData
                      ? "Change uploaded photo"
                      : "Upload your own photo"}
                  </span>

                  <span className="mt-0.5 block text-[8px] text-gray-400">
                    JPG, PNG or WebP up to 10 MB
                  </span>
                </span>

                <ChevronRight
                  size={14}
                  className="shrink-0 text-gray-400"
                />
              </button>

              {uploadError && (
                <p className="mt-2 text-center text-[9px] text-red-500">
                  {uploadError}
                </p>
              )}

              <fieldset className="mt-5">
                <legend className="sr-only">
                  Goal icon
                </legend>

                <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
                  {SAVINGS_GOAL_ICONS.map(
                    (item) => {
                      const Icon = item.icon;
                      const active =
                        !form.imageData &&
                        form.iconId === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          title={item.label}
                          aria-label={item.label}
                          aria-pressed={active}
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              iconId: item.id,
                              imageData: "",
                            }));
                            setIconPickerOpen(false);
                            nameInputRef.current?.focus();
                          }}
                          className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl p-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                        >
                          <span className="relative flex h-20 w-20 shrink-0 transition-transform group-active:scale-95 sm:h-[88px] sm:w-[88px]">
                            <span
                              className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 ${
                                active
                                  ? "border-black ring-2 ring-black ring-offset-2"
                                  : "border-transparent"
                              }`}
                              style={{
                                background:
                                  item.background,
                                color: item.color,
                              }}
                            >
                              <Icon
                                size={30}
                                strokeWidth={1.45}
                              />
                            </span>

                            {active && (
                              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black ring-2 ring-black">
                                <Check
                                  size={12}
                                  strokeWidth={2.5}
                                />
                              </span>
                            )}
                          </span>

                          <span className="max-w-full truncate text-[9px] font-medium text-gray-500">
                            {item.label}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </fieldset>
            </motion.div>
          ) : (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.15 }}
              className="flex min-h-[calc(100dvh-73px)] flex-1 flex-col px-5 pb-5 pt-7 sm:min-h-[500px] sm:px-7 sm:pb-7"
            >
              {currentStep === 0 && (
                <div className="flex flex-1 flex-col">
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setIconPickerOpen(true)
                      }
                      aria-label="Choose goal icon"
                      className="group relative inline-flex h-28 w-28 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                    >
                      <span
                        className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full"
                        style={{
                          background:
                            selectedIcon.background,
                          color: selectedIcon.color,
                        }}
                      >
                        {form.imageData ? (
                          <img
                            src={form.imageData}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <SelectedIcon
                            size={46}
                            strokeWidth={1.4}
                          />
                        )}
                      </span>

                      <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-black text-white shadow-sm transition-transform group-hover:scale-105">
                        <Pencil
                          size={14}
                          strokeWidth={1.8}
                        />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setIconPickerOpen(true)
                      }
                      className="mx-auto mt-4 flex items-center gap-1.5 text-[9px] font-medium text-gray-400 transition-colors hover:text-black"
                    >
                      {form.imageData
                        ? "Custom photo"
                        : selectedIcon.label}
                      <ChevronRight size={11} />
                    </button>
                  </div>

                  <div className="mx-auto mt-10 w-full max-w-[460px] text-center">
                    <label
                      htmlFor="savings-goal-name"
                      className="text-[18px] font-semibold tracking-[-0.025em] text-gray-950"
                    >
                      {step.description}
                    </label>

                    <input
                      ref={nameInputRef}
                      id="savings-goal-name"
                      value={form.name}
                      maxLength={NAME_LIMIT}
                      autoComplete="off"
                      autoFocus
                      onChange={(event) =>
                        setField(
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Emergency fund"
                      aria-invalid={Boolean(
                        errors.name,
                      )}
                      aria-describedby="savings-goal-name-help"
                      className={`mt-5 h-12 w-full border-b-2 bg-transparent px-2 text-center text-[18px] font-medium text-gray-950 outline-none placeholder:text-gray-300 ${
                        errors.name
                          ? "border-red-400"
                          : "border-gray-200 focus:border-black"
                      }`}
                    />

                    <div
                      id="savings-goal-name-help"
                      className="mt-2 flex min-h-4 items-center justify-center"
                    >
                      {errors.name ? (
                        <p className="text-[9px] text-red-500">
                          {errors.name}
                        </p>
                      ) : (
                        <p className="text-[9px] tabular-nums text-gray-400">
                          {form.name.length}/
                          {NAME_LIMIT}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="flex flex-1 flex-col">
                  <div className="text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-800">
                      <Coins
                        size={27}
                        strokeWidth={1.45}
                      />
                    </span>

                    <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.03em] text-gray-950">
                      {step.title}
                    </h3>

                    <p className="mx-auto mt-2 max-w-[340px] text-[10px] leading-5 text-gray-400">
                      {step.description} This becomes the opening balance for {form.name || "your goal"}.
                    </p>
                  </div>

                  <div className="mx-auto mt-6 w-full max-w-[430px] rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                    <div className="flex items-center justify-between gap-4 border-b border-gray-200/70 pb-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-gray-950">
                          Datong Wallet
                        </p>

                        <p className="mt-0.5 text-[8px] text-gray-400">
                          Cash balance
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          walletLoading ||
                          Boolean(walletError) ||
                          normalizedWalletBalance <= 0
                        }
                        onClick={() =>
                          setField(
                            "currentAmount",
                            String(
                              normalizedWalletBalance +
                                originalGoalAmount,
                            ),
                          )
                        }
                        className="rounded-full bg-black px-3 py-1.5 text-[8px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Use full balance
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div>
                        <p className="text-[8px] text-gray-400">
                          Datong Wallet
                        </p>

                        {walletLoading ? (
                          <span className="mt-1 block h-3 w-16 animate-pulse rounded bg-gray-200" />
                        ) : (
                          <motion.p
                            key={`${form.currentAmount}-${overWalletBalance}`}
                            initial={{
                              opacity: 0.45,
                              y: -2,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.12,
                            }}
                            className={`mt-1 text-[11px] font-semibold tabular-nums ${
                              drainsWallet &&
                              !overWalletBalance
                                ? "text-red-600"
                                : "text-gray-950"
                            }`}
                          >
                            {overWalletBalance
                              ? formatPeso(
                                  normalizedWalletBalance,
                                )
                              : formatPeso(
                                  walletBalanceAfter,
                                )}
                          </motion.p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-[8px] text-gray-400">
                          Savings balance
                        </p>

                        <motion.p
                          key={`savings-${form.currentAmount}`}
                          initial={{
                            opacity: 0.45,
                            y: -2,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.12,
                          }}
                          className={`mt-1 text-[11px] font-semibold tabular-nums ${
                            overWalletBalance
                              ? "text-red-600"
                              : "text-gray-950"
                          }`}
                        >
                          {overWalletBalance
                            ? "---"
                            : formatPeso(
                                startingAmountValid
                                  ? numericStartingAmount
                                  : 0,
                              )}
                        </motion.p>
                      </div>
                    </div>

                    {walletError && (
                      <p className="mt-3 border-t border-red-100 pt-2 text-center text-[8px] text-red-500">
                        {walletError}
                      </p>
                    )}
                  </div>

                  <motion.div
                    animate={
                      overWalletBalance
                        ? {
                            x: [
                              0,
                              -7,
                              7,
                              -5,
                              5,
                              -2,
                              2,
                              0,
                            ],
                          }
                        : {
                            x: 0,
                          }
                    }
                    transition={
                      overWalletBalance
                        ? {
                            duration: 0.38,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 0.45,
                          }
                        : {
                            duration: 0.15,
                          }
                    }
                    className="mt-8"
                  >
                    <MoneyInput
                      id="savings-goal-current"
                      value={form.currentAmount}
                      placeholder="0.00"
                      autoFocus
                      invalid={Boolean(
                        errors.currentAmount ||
                          overWalletBalance,
                      )}
                      danger={drainsWallet}
                      describedBy="savings-goal-current-error"
                      onChange={(value) =>
                        handleMoneyChange(
                          "currentAmount",
                          value,
                        )
                      }
                    />

                    <div
                      id="savings-goal-current-error"
                      className="mt-2 min-h-4 text-center"
                    >
                      {errors.currentAmount ? (
                        <p className="text-[9px] text-red-500">
                          {errors.currentAmount}
                        </p>
                      ) : overWalletBalance ? (
                        <p className="text-[9px] text-red-500">
                          This exceeds your Datong Wallet by {formatPeso(Math.abs(walletBalanceAfter))}.
                        </p>
                      ) : drainsWallet ? (
                        <p className="text-[9px] font-medium text-red-500">
                          This will use your full Datong Wallet balance.
                        </p>
                      ) : (
                        <p className="text-[9px] text-gray-400">
                          Optional — enter an amount within your wallet balance.
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-1 flex-col">
                  <div className="text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                      <Target
                        size={27}
                        strokeWidth={1.45}
                      />
                    </span>

                    <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.03em] text-gray-950">
                      {step.title}
                    </h3>

                    <p className="mx-auto mt-2 max-w-[380px] text-[10px] leading-5 text-gray-400">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-9">
                    <MoneyInput
                      id="savings-goal-target"
                      value={form.targetAmount}
                      placeholder="10,000.00"
                      autoFocus
                      invalid={Boolean(
                        errors.targetAmount,
                      )}
                      describedBy="savings-goal-target-error"
                      onChange={(value) =>
                        handleMoneyChange(
                          "targetAmount",
                          value,
                        )
                      }
                    />

                    <div
                      id="savings-goal-target-error"
                      className="mt-2 min-h-4 text-center"
                    >
                      {errors.targetAmount && (
                        <p className="text-[9px] text-red-500">
                          {errors.targetAmount}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mx-auto mt-7 w-full max-w-[430px]">
                    <label
                      htmlFor="savings-goal-date"
                      className="mb-2 block text-[10px] font-medium text-gray-600"
                    >
                      Target date
                      <span className="ml-1 font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={16}
                        strokeWidth={1.5}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="savings-goal-date"
                        type="date"
                        value={form.targetDate}
                        onChange={(event) =>
                          setField(
                            "targetDate",
                            event.target.value,
                          )
                        }
                        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-[12px] font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <footer className="mt-8 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  {editing &&
                    currentStep === 2 && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          onDelete?.(goal)
                        }
                        aria-label="Delete savings goal"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2
                          size={16}
                          strokeWidth={1.7}
                        />
                      </button>
                    )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 text-[11px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
                  >
                    {currentStep === 2 ? (
                      <>
                        <Target
                          size={14}
                          strokeWidth={1.8}
                        />
                        {saving
                          ? editing
                            ? "Saving..."
                            : "Opening goal..."
                          : editing
                            ? "Save goal"
                            : "Create goal"}
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight
                          size={14}
                          strokeWidth={1.8}
                        />
                      </>
                    )}
                  </button>
                </div>

                {currentStep === 1 && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={
                      handleSkipStartingAmount
                    }
                    className="mt-2 h-9 w-full rounded-lg text-[10px] font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-black"
                  >
                    Skip and start from zero
                  </button>
                )}
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </ModalShell>
  );
}

export default SavingsGoalModal;
