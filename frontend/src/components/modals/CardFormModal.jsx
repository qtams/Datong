import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleOff,
  CreditCard,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Save,
  UploadCloud,
  WalletCards,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import ModalShell from "./ModalShell";

import ResponsiveSelect from "../forms/ResponsiveSelect";

/* =========================================================
   CONFIG
========================================================= */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EMPTY_FORM = {
  name: "",
  type: "e_wallet",
  status: "active",
};

/* =========================================================
   STEPS
========================================================= */

const STEPS = [
  {
    id: 1,
    title: "Card information",
    description: "Name, type and availability",
  },

  {
    id: 2,
    title: "Card artwork",
    description: "Landscape and portrait images",
  },
];

/* =========================================================
   TYPE OPTIONS
========================================================= */

const TYPE_OPTIONS = [
  {
    value: "e_wallet",
    label: "E-Wallet",
    description: "Digital wallet or mobile payment provider.",
    icon: WalletCards,
  },

  {
    value: "bank",
    label: "Bank",
    description: "Traditional or digital banking provider.",
    icon: Building2,
  },
];

/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
    description: "Available for members to select.",
    icon: CheckCircle2,
  },

  {
    value: "inactive",
    label: "Inactive",
    description: "Hidden from member card selection.",
    icon: CircleOff,
  },
];

/* =========================================================
   PROGRESS
========================================================= */

function ProgressHeader({ currentStep, onBack }) {
  const current = STEPS.find((step) => step.id === currentStep) || STEPS[0];

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold text-gray-900">
              Step {currentStep} of {STEPS.length}
            </p>

            <span className="h-1 w-1 rounded-full bg-gray-300" />

            <p className="truncate text-[10px] font-medium text-gray-400">
              {current.title}
            </p>
          </div>

          <p className="mt-1 text-[9px] text-gray-400">{current.description}</p>
        </div>

        {currentStep === 2 && (
          <button
            type="button"
            onClick={onBack}
            className="
              shrink-0
              rounded-md
              px-2
              py-1
              text-[9px]
              font-medium
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            Edit details
          </button>
        )}
      </div>

      <div className="h-[3px] overflow-hidden bg-gray-100">
        <motion.div
          initial={false}
          animate={{
            width: `${progress}%`,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="h-full bg-black"
        />
      </div>
    </div>
  );
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

function ImageUploadField({
  label,
  description,
  file,
  preview,
  existingUrl,
  error,
  inputRef,
  onChange,
  onClearNewFile,
  aspect = "landscape",
  disabled = false,
}) {
  const portrait = aspect === "portrait";

  const hasNewFile = file instanceof File;

  const hasExisting = Boolean(existingUrl);

  const imageToShow = preview || existingUrl || "";

  /* =======================================================
     DROP
  ======================================================= */

  const handleDrop = (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const selected = event.dataTransfer.files?.[0];

    if (selected) {
      onChange(selected);
    }
  };

  return (
    <div>
      {/* LABEL */}

      <div className="mb-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-medium text-gray-800">
            {label}

            <span className="ml-1 text-red-500">*</span>
          </label>

          {hasExisting && !hasNewFile && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-medium text-emerald-600">
              Current
            </span>
          )}

          {hasNewFile && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-medium text-blue-600">
              New
            </span>
          )}
        </div>

        <p className="mt-0.5 text-[9px] text-gray-400">{description}</p>
      </div>

      {/* FILE INPUT */}

      <input
        ref={inputRef}
        type="file"
        disabled={disabled}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0];

          if (selected) {
            onChange(selected);
          }

          event.target.value = "";
        }}
      />

      {/* EMPTY */}

      {!imageToShow ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={`
            flex
            w-full
            flex-col
            items-center
            justify-center

            rounded-xl

            border
            border-dashed

            bg-gray-50/70

            px-5

            text-center

            transition-all

            ${portrait ? "min-h-[260px]" : "min-h-[190px]"}

            ${error ? "border-red-300" : "border-gray-300"}

            hover:border-gray-400
            hover:bg-gray-50

            disabled:opacity-60
          `}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400">
            <UploadCloud size={18} strokeWidth={1.6} />
          </div>

          <p className="mt-3 text-[11px] font-semibold text-gray-800">
            Upload image
          </p>

          <p className="mt-1 text-[9px] text-gray-400">Tap to browse</p>

          <p className="mt-2 text-[8px] text-gray-300">
            PNG, JPG or WEBP · Max 5 MB
          </p>
        </button>
      ) : (
        /* =================================================
           PREVIEW
        ================================================= */

        <div
          className={`
            relative

            overflow-hidden

            rounded-xl

            border
            border-gray-200

            bg-gray-100

            ${portrait ? "aspect-[0.64/1]" : "aspect-[1.586/1]"}
          `}
        >
          <img
            src={imageToShow}
            alt={label}
            className="h-full w-full object-cover"
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0

              flex
              items-end
              justify-between
              gap-3

              bg-gradient-to-t
              from-black/80
              via-black/25
              to-transparent

              px-3
              pb-3
              pt-10
            "
          >
            <div className="min-w-0">
              <p className="text-[9px] font-medium text-white">
                {hasNewFile ? "New image selected" : "Current image"}
              </p>

              {hasNewFile && (
                <p className="mt-0.5 truncate text-[8px] text-white/60">
                  {file.name}
                </p>
              )}
            </div>

            {!disabled && (
              <div className="flex shrink-0 gap-1.5">
                {/* REPLACE */}

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="
                    h-8
                    rounded-lg

                    border
                    border-white/15

                    bg-black/35

                    px-2.5

                    text-[9px]
                    font-medium
                    text-white

                    backdrop-blur-sm
                  "
                >
                  Replace
                </button>

                {/* REVERT NEW FILE */}

                {hasNewFile && hasExisting && (
                  <button
                    type="button"
                    onClick={onClearNewFile}
                    className="
                      h-8
                      rounded-lg

                      border
                      border-white/15

                      bg-black/35

                      px-2.5

                      text-[9px]
                      font-medium
                      text-white

                      backdrop-blur-sm
                    "
                  >
                    Revert
                  </button>
                )}

                {/* REMOVE NEW FILE ON CREATE */}

                {hasNewFile && !hasExisting && (
                  <button
                    type="button"
                    onClick={onClearNewFile}
                    aria-label={`Remove ${label}`}
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center

                      rounded-lg

                      border
                      border-white/15

                      bg-black/35

                      text-white

                      backdrop-blur-sm
                    "
                  >
                    <X size={13} strokeWidth={1.7} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

/* =========================================================
   CARD FORM MODAL
========================================================= */

function CardFormModal({
  open,
  onClose,
  onSubmit,
  card = null,
  submitting = false,
}) {
  const editing = Boolean(card);

  const landscapeInputRef = useRef(null);

  const portraitInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [currentStep, setCurrentStep] = useState(1);

  const [landscapeFile, setLandscapeFile] = useState(null);

  const [portraitFile, setPortraitFile] = useState(null);

  const [landscapePreview, setLandscapePreview] = useState("");

  const [portraitPreview, setPortraitPreview] = useState("");

  const [errors, setErrors] = useState({});

  /* =======================================================
     EXISTING URLS
  ======================================================= */

  const existingLandscape = editing ? card?.landscape_image_url || "" : "";

  const existingPortrait = editing ? card?.portrait_image_url || "" : "";

  /* =======================================================
     RESET / POPULATE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentStep(1);

    setLandscapeFile(null);

    setPortraitFile(null);

    setLandscapePreview("");

    setPortraitPreview("");

    setErrors({});

    if (card) {
      setForm({
        name: card.name || "",

        type: card.type || "e_wallet",

        status: card.status || "active",
      });

      return;
    }

    setForm({
      ...EMPTY_FORM,
    });
  }, [open, card]);

  /* =======================================================
     LANDSCAPE FILE PREVIEW
  ======================================================= */

  useEffect(() => {
    if (!landscapeFile) {
      setLandscapePreview("");

      return undefined;
    }

    const url = URL.createObjectURL(landscapeFile);

    setLandscapePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [landscapeFile]);

  /* =======================================================
     PORTRAIT FILE PREVIEW
  ======================================================= */

  useEffect(() => {
    if (!portraitFile) {
      setPortraitPreview("");

      return undefined;
    }

    const url = URL.createObjectURL(portraitFile);

    setPortraitPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [portraitFile]);

  /* =======================================================
     FIELD
  ======================================================= */

  const setField = (name, value) => {
    setForm((current) => ({
      ...current,

      [name]: value,
    }));

    setErrors((current) => ({
      ...current,

      [name]: "",
    }));
  };

  /* =======================================================
     IMAGE VALIDATION
  ======================================================= */

  const validateImage = (file, field) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((current) => ({
        ...current,

        [field]: "Use PNG, JPG or WEBP only.",
      }));

      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((current) => ({
        ...current,

        [field]: "Image cannot exceed 5 MB.",
      }));

      return false;
    }

    setErrors((current) => ({
      ...current,

      [field]: "",
    }));

    return true;
  };

  /* =======================================================
     STEP 1
  ======================================================= */

  const validateStepOne = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Card name is required.";
    }

    if (!form.type) {
      next.type = "Type is required.";
    }

    if (!form.status) {
      next.status = "Status is required.";
    }

    setErrors((current) => ({
      ...current,

      name: "",
      type: "",
      status: "",

      ...next,
    }));

    return Object.keys(next).length === 0;
  };

  /* =======================================================
     STEP 2

     CREATE:
     Both new files required.

     EDIT:
     Existing image counts as valid.
  ======================================================= */

  const validateStepTwo = () => {
    const next = {};

    const hasLandscape = Boolean(landscapeFile || existingLandscape);

    const hasPortrait = Boolean(portraitFile || existingPortrait);

    if (!hasLandscape) {
      next.landscape_image = "Landscape image is required.";
    }

    if (!hasPortrait) {
      next.portrait_image = "Portrait image is required.";
    }

    setErrors((current) => ({
      ...current,

      landscape_image: "",

      portrait_image: "",

      ...next,
    }));

    return Object.keys(next).length === 0;
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (currentStep === 1) {
      if (validateStepOne()) {
        setCurrentStep(2);
      }

      return;
    }

    if (!validateStepOne()) {
      setCurrentStep(1);

      return;
    }

    if (!validateStepTwo()) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * During edit, null means:
     * "keep the current Cloudinary image".
     *
     * cardCatalogApi only appends actual File objects.
     */

    onSubmit?.({
      name: form.name.trim(),

      type: form.type,

      status: form.status,

      landscape_image: landscapeFile,

      portrait_image: portraitFile,
    });
  };

  /* =======================================================
     CLOSED
  ======================================================= */

  if (!open) {
    return null;
  }

  return (
    <ModalShell
      mobileSheet
      onClose={() => {
        if (!submitting) {
          onClose?.();
        }
      }}
      size="max-w-[720px]"
      labelledBy="card-form-title"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="sticky top-0 z-30 flex items-start justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
            {editing ? (
              <Pencil size={16} strokeWidth={1.7} />
            ) : (
              <CreditCard size={17} strokeWidth={1.6} />
            )}
          </div>

          <div className="min-w-0">
            <h2
              id="card-form-title"
              className="text-[14px] font-semibold tracking-[-0.02em] text-gray-950"
            >
              {editing ? "Edit card" : "Add card"}
            </h2>

            <p className="mt-1 text-[9px] text-gray-400">
              {editing
                ? `Update ${card?.name || "card"} details and artwork.`
                : "Add a bank or e-wallet provider."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          aria-label="Close modal"
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
            hover:text-gray-900

            disabled:opacity-40
          "
        >
          <X size={16} strokeWidth={1.6} />
        </button>
      </div>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <ProgressHeader
        currentStep={currentStep}
        onBack={() => setCurrentStep(1)}
      />

      {/* =================================================
          FORM
      ================================================= */}

      <form onSubmit={handleSubmit}>
        <div className="min-h-[420px] p-5 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {/* =============================================
                STEP 1
            ============================================= */}

            {currentStep === 1 && (
              <motion.div
                key="details"
                initial={{
                  opacity: 0,
                  x: -12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -12,
                }}
                transition={{
                  duration: 0.18,
                  ease: "easeOut",
                }}
              >
                <div className="mb-5">
                  <h3 className="text-[13px] font-semibold text-gray-900">
                    Card details
                  </h3>

                  <p className="mt-1 text-[9px] text-gray-400">
                    Basic provider information.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* NAME */}

                  <div>
                    <label
                      htmlFor="card-name"
                      className="mb-1.5 block text-[11px] font-medium text-gray-700"
                    >
                      Card name
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <CreditCard
                        size={14}
                        strokeWidth={1.5}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="card-name"
                        value={form.name}
                        autoFocus
                        disabled={submitting}
                        onChange={(event) =>
                          setField("name", event.target.value)
                        }
                        placeholder="Example: GCash"
                        className={`
                          h-12
                          w-full

                          rounded-lg

                          border

                          bg-white

                          pl-10
                          pr-3

                          text-[12px]
                          text-gray-900

                          outline-none

                          transition-all

                          placeholder:text-gray-400

                          ${
                            errors.name
                              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                              : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                          }

                          disabled:bg-gray-50
                        `}
                      />
                    </div>

                    {errors.name && (
                      <p className="mt-1.5 text-[10px] text-red-500">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* TYPE */}

                  <ResponsiveSelect
                    label="Type"
                    value={form.type}
                    options={TYPE_OPTIONS}
                    onChange={(value) => setField("type", value)}
                    error={errors.type}
                    disabled={submitting}
                    sheetDescription="Choose whether this provider is an e-wallet or bank."
                  />

                  {/* STATUS */}

                  <ResponsiveSelect
                    label="Status"
                    value={form.status}
                    options={STATUS_OPTIONS}
                    onChange={(value) => setField("status", value)}
                    error={errors.status}
                    disabled={submitting}
                    sheetDescription="Choose whether members can currently use this card."
                  />
                </div>
              </motion.div>
            )}

            {/* =============================================
                STEP 2
            ============================================= */}

            {currentStep === 2 && (
              <motion.div
                key="images"
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 12,
                }}
                transition={{
                  duration: 0.18,
                  ease: "easeOut",
                }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <ImageIcon size={15} strokeWidth={1.6} />
                  </div>

                  <div>
                    <h3 className="text-[13px] font-semibold text-gray-900">
                      Card artwork
                    </h3>

                    <p className="mt-1 text-[9px] text-gray-400">
                      {editing
                        ? "Keep the current images or replace either one."
                        : "Upload both orientations."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* LANDSCAPE */}

                  <ImageUploadField
                    label="Landscape"
                    description="Desktop and wide layouts."
                    file={landscapeFile}
                    preview={landscapePreview}
                    existingUrl={existingLandscape}
                    error={errors.landscape_image}
                    inputRef={landscapeInputRef}
                    disabled={submitting}
                    onChange={(file) => {
                      if (validateImage(file, "landscape_image")) {
                        setLandscapeFile(file);
                      }
                    }}
                    onClearNewFile={() => setLandscapeFile(null)}
                  />

                  {/* PORTRAIT */}

                  <ImageUploadField
                    label="Portrait"
                    description="Mobile and compact layouts."
                    file={portraitFile}
                    preview={portraitPreview}
                    existingUrl={existingPortrait}
                    error={errors.portrait_image}
                    inputRef={portraitInputRef}
                    disabled={submitting}
                    aspect="portrait"
                    onChange={(file) => {
                      if (validateImage(file, "portrait_image")) {
                        setPortraitFile(file);
                      }
                    }}
                    onClearNewFile={() => setPortraitFile(null)}
                  />
                </div>

                {/* EDIT NOTE */}

                {editing && (
                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-[9px] leading-5 text-gray-500">
                      You do not need to re-upload existing artwork. Only images
                      you replace will be sent to the server.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-2 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:bg-gray-50/95 sm:px-6">
          {/* BACK */}

          <div>
            {currentStep === 2 && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => setCurrentStep(1)}
                className="
                  flex
                  h-10
                  items-center
                  gap-2

                  rounded-lg

                  border
                  border-gray-200

                  bg-white

                  px-3

                  text-[10px]
                  font-medium
                  text-gray-600

                  hover:bg-gray-50

                  disabled:opacity-50
                "
              >
                <ArrowLeft size={13} strokeWidth={1.7} />
                Back
              </button>
            )}
          </div>

          {/* STEP 1 */}

          {currentStep === 1 ? (
            <button
              type="submit"
              disabled={submitting}
              className="
                flex
                h-10
                items-center
                gap-2

                rounded-lg

                bg-black

                px-5

                text-[10px]
                font-medium
                text-white

                hover:bg-gray-800

                disabled:opacity-50
              "
            >
              Continue
              <ArrowRight size={13} strokeWidth={1.7} />
            </button>
          ) : (
            /* =============================================
               SAVE
            ============================================= */

            <button
              type="submit"
              disabled={submitting}
              className="
                flex
                h-10
                min-w-[120px]
                items-center
                justify-center
                gap-2

                rounded-lg

                bg-black

                px-5

                text-[10px]
                font-medium
                text-white

                hover:bg-gray-800

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting ? (
                <>
                  <LoaderCircle size={13} className="animate-spin" />

                  {editing ? "Saving..." : "Uploading..."}
                </>
              ) : editing ? (
                <>
                  <Save size={13} strokeWidth={1.7} />
                  Save changes
                </>
              ) : (
                <>
                  <UploadCloud size={13} strokeWidth={1.7} />
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

export default CardFormModal;
