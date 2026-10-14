import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  Copy,
  KeyRound,
  PencilLine,
  Save,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import toast from "react-hot-toast";

import ModalShell from "./ModalShell";

import BirthdayPicker from "../forms/BirthdayPicker";
import RoleSelect from "../forms/RoleSelect";

import { generateDefaultPassword } from "../../utils/userPassword";

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  fullname: "",
  nickname: "",
  username: "",
  email: "",
  birthday: "",
  role: "Staff",
};

/* =========================================================
   STEPS
========================================================= */

const STEPS = [
  {
    id: 1,
    title: "User information",
    description: "Personal and login details",
  },
  {
    id: 2,
    title: "Account details",
    description: "Birthday, role and access credentials",
  },
];

/* =========================================================
   USERNAME GENERATOR
========================================================= */

function generateUsername(fullname) {
  if (!fullname) {
    return "";
  }

  return fullname
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

/* =========================================================
   TODAY
========================================================= */

function getTodayValue() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(fullname) {
  if (!fullname) {
    return "U";
  }

  return fullname
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/* =========================================================
   PROGRESS HEADER
========================================================= */

function ProgressHeader({ currentStep, onBackToStepOne }) {
  const current = STEPS.find((step) => step.id === currentStep) || STEPS[0];

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="border-b border-gray-100 bg-white">
      {/* ===============================================
          STEP INFO
      =============================================== */}

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
            onClick={onBackToStepOne}
            className="
              shrink-0
              rounded-md
              px-2
              py-1
              text-[9px]
              font-medium
              text-gray-400
              transition-colors
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            Edit details
          </button>
        )}
      </div>

      {/* ===============================================
          PROGRESS LINE
      =============================================== */}

      <div className="h-[3px] w-full overflow-hidden bg-gray-100">
        <motion.div
          initial={false}
          animate={{
            width: `${progress}%`,
          }}
          transition={{
            duration: 0.32,
            ease: "easeOut",
          }}
          className="h-full bg-black"
        />
      </div>
    </div>
  );
}

/* =========================================================
   USER FORM MODAL
========================================================= */

function UserFormModal({ open, onClose, onSubmit, user }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const [currentStep, setCurrentStep] = useState(1);

  const [errors, setErrors] = useState({});

  const [copied, setCopied] = useState(false);

  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);

  const editing = Boolean(user);

  /* =======================================================
     DEFAULT PASSWORD
  ======================================================= */

  const defaultPassword = useMemo(
    () => generateDefaultPassword(form.birthday),
    [form.birthday],
  );

  /* =======================================================
     POPULATE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentStep(1);

    setErrors({});

    setCopied(false);

    if (user) {
      setForm({
        fullname: user.fullname || "",

        nickname: user.nickname || "",

        username: user.username || "",

        email: user.email || "",

        birthday: user.birthday || "",

        role: user.role || "Staff",
      });

      setUsernameManuallyEdited(true);

      return;
    }

    setForm(EMPTY_FORM);

    setUsernameManuallyEdited(false);
  }, [open, user]);

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    /* USERNAME */

    if (name === "username") {
      const normalized = value
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9._-]/g, "");

      setUsernameManuallyEdited(true);

      setForm((current) => ({
        ...current,

        username: normalized,
      }));

      setErrors((current) => ({
        ...current,

        username: "",
      }));

      return;
    }

    /* FULL NAME */

    if (name === "fullname") {
      setForm((current) => ({
        ...current,

        fullname: value,

        username:
          !editing && !usernameManuallyEdited
            ? generateUsername(value)
            : current.username,
      }));

      setErrors((current) => ({
        ...current,

        fullname: "",
      }));

      return;
    }

    /* NORMAL FIELD */

    setForm((current) => ({
      ...current,

      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,

        [name]: "",
      }));
    }
  };

  /* =======================================================
     BIRTHDAY
  ======================================================= */

  const handleBirthdayChange = (value) => {
    setForm((current) => ({
      ...current,

      birthday: value,
    }));

    setCopied(false);

    setErrors((current) => ({
      ...current,

      birthday: "",
    }));
  };

  /* =======================================================
     ROLE
  ======================================================= */

  const handleRoleChange = (value) => {
    setForm((current) => ({
      ...current,

      role: value,
    }));

    setErrors((current) => ({
      ...current,

      role: "",
    }));
  };

  /* =======================================================
     STEP 1 VALIDATION
  ======================================================= */

  const validateStepOne = () => {
    const nextErrors = {};

    /* FULL NAME */

    if (!form.fullname.trim()) {
      nextErrors.fullname = "Full name is required.";
    }

    /* USERNAME */

    const username = form.username.trim().toLowerCase();

    if (!username) {
      nextErrors.username = "Username is required.";
    } else if (username.length < 3) {
      nextErrors.username = "Username must be at least 3 characters.";
    } else if (username.length > 50) {
      nextErrors.username = "Username cannot exceed 50 characters.";
    } else if (!/^[a-z0-9._-]+$/.test(username)) {
      nextErrors.username =
        "Use letters, numbers, dots, underscores or dashes only.";
    }

    /* EMAIL */

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors((current) => ({
      ...current,

      fullname: "",

      username: "",

      email: "",

      ...nextErrors,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  /* =======================================================
     STEP 2 VALIDATION
  ======================================================= */

  const validateStepTwo = () => {
    const nextErrors = {};

    /* BIRTHDAY */

    if (!form.birthday) {
      nextErrors.birthday = "Birthday is required.";
    } else if (form.birthday > getTodayValue()) {
      nextErrors.birthday = "Birthday cannot be in the future.";
    }

    /* ROLE */

    if (!form.role) {
      nextErrors.role = "Role is required.";
    }

    setErrors((current) => ({
      ...current,

      birthday: "",

      role: "",

      ...nextErrors,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    if (!validateStepOne()) {
      return;
    }

    setCurrentStep(2);
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    setCurrentStep(1);
  };

  /* =======================================================
     COPY PASSWORD
  ======================================================= */

  const handleCopyPassword = async () => {
    if (!defaultPassword) {
      toast.error("Select a birthday first.");

      return;
    }

    try {
      await navigator.clipboard.writeText(defaultPassword);

      setCopied(true);

      toast.success("Password copied.");

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      toast.error("Unable to copy password.");
    }
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

    if (!validateStepOne()) {
      setCurrentStep(1);

      return;
    }

    if (!validateStepTwo()) {
      return;
    }

    onSubmit({
      fullname: form.fullname.trim(),

      nickname: form.nickname.trim(),

      username: form.username.trim().toLowerCase(),

      email: form.email.trim().toLowerCase(),

      birthday: form.birthday,

      role: form.role,

      default_password: generateDefaultPassword(form.birthday),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <ModalShell
          onClose={onClose}
          size="max-w-[620px]"
          labelledBy="user-modal-title"
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="sticky top-0 z-30 flex items-start justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                {editing ? (
                  <PencilLine size={17} strokeWidth={1.6} />
                ) : (
                  <UserPlus size={17} strokeWidth={1.6} />
                )}
              </div>

              <div className="min-w-0">
                <h2
                  id="user-modal-title"
                  className="text-[14px] font-semibold tracking-[-0.02em] text-gray-950"
                >
                  {editing ? "Edit user" : "Add user"}
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-gray-400">
                  {editing
                    ? "Update user details and workspace access."
                    : "Create a new Datong workspace user."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="
                ml-4
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
            onBackToStepOne={handleBack}
          />

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>
            <div className="min-h-[390px] p-5 sm:p-6">
              <AnimatePresence mode="wait" initial={false}>
                {/* =================================================
                    STEP 1
                ================================================= */}

                {currentStep === 1 && (
                  <motion.div
                    key="user-info"
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
                      duration: 0.18,

                      ease: "easeOut",
                    }}
                  >
                    {/* =============================================
                        SECTION TITLE
                    ============================================= */}

                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        <UserRound size={15} strokeWidth={1.6} />
                      </div>

                      <div>
                        <h3 className="text-[12px] font-semibold text-gray-900">
                          User information
                        </h3>

                        <p className="mt-0.5 text-[9px] text-gray-400">
                          Personal, contact and sign-in details.
                        </p>
                      </div>
                    </div>

                    {/* =============================================
                        FIELDS
                    ============================================= */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* FULL NAME */}

                      <div>
                        <label
                          htmlFor="fullname"
                          className="mb-1.5 block text-[11px] font-medium text-gray-700"
                        >
                          Full name
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="fullname"
                          type="text"
                          name="fullname"
                          value={form.fullname}
                          onChange={handleChange}
                          autoComplete="name"
                          autoFocus
                          placeholder="Enter full name"
                          className={`
                            h-11
                            w-full
                            rounded-lg
                            border
                            bg-white
                            px-3
                            text-[12px]
                            text-gray-900
                            outline-none
                            transition-all
                            placeholder:text-gray-400

                            ${
                              errors.fullname
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            }
                          `}
                        />

                        {errors.fullname && (
                          <p className="mt-1.5 text-[10px] text-red-500">
                            {errors.fullname}
                          </p>
                        )}
                      </div>

                      {/* NICKNAME */}

                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label
                            htmlFor="nickname"
                            className="text-[11px] font-medium text-gray-700"
                          >
                            Nickname
                          </label>

                          <span className="text-[9px] text-gray-400">
                            Optional
                          </span>
                        </div>

                        <input
                          id="nickname"
                          type="text"
                          name="nickname"
                          value={form.nickname}
                          onChange={handleChange}
                          placeholder="Enter nickname"
                          className="
                            h-11
                            w-full
                            rounded-lg
                            border
                            border-gray-200
                            bg-white
                            px-3
                            text-[12px]
                            text-gray-900
                            outline-none
                            transition-all
                            placeholder:text-gray-400
                            focus:border-gray-400
                            focus:ring-2
                            focus:ring-gray-100
                          "
                        />
                      </div>

                      {/* USERNAME */}

                      <div className="sm:col-span-2">
                        <div className="mb-1.5 flex items-center justify-between">
                          <label
                            htmlFor="username"
                            className="text-[11px] font-medium text-gray-700"
                          >
                            Username
                            <span className="ml-1 text-red-500">*</span>
                          </label>

                          <span className="text-[9px] text-gray-400">
                            Used for login
                          </span>
                        </div>

                        <div className="relative">
                          <AtSign
                            size={14}
                            strokeWidth={1.5}
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
                            id="username"
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="tamahome.buendia"
                            className={`
                              h-11
                              w-full
                              rounded-lg
                              border
                              bg-white
                              pl-9
                              pr-3
                              text-[12px]
                              text-gray-900
                              outline-none
                              transition-all
                              placeholder:text-gray-400

                              ${
                                errors.username
                                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                  : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                              }
                            `}
                          />
                        </div>

                        {errors.username ? (
                          <p className="mt-1.5 text-[10px] text-red-500">
                            {errors.username}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-[9px] text-gray-400">
                            Generated automatically from the full name. You can
                            change it.
                          </p>
                        )}
                      </div>

                      {/* EMAIL */}

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="email"
                          className="mb-1.5 block text-[11px] font-medium text-gray-700"
                        >
                          Email address
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          autoComplete="email"
                          placeholder="user@datong.com"
                          className={`
                            h-11
                            w-full
                            rounded-lg
                            border
                            bg-white
                            px-3
                            text-[12px]
                            text-gray-900
                            outline-none
                            transition-all
                            placeholder:text-gray-400

                            ${
                              errors.email
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            }
                          `}
                        />

                        {errors.email && (
                          <p className="mt-1.5 text-[10px] text-red-500">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    STEP 2
                ================================================= */}

                {currentStep === 2 && (
                  <motion.div
                    key="account-details"
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
                      duration: 0.18,

                      ease: "easeOut",
                    }}
                  >
                    {/* =============================================
                        USER SUMMARY
                    ============================================= */}

                    <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                          {getInitials(form.fullname)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-gray-900">
                            {form.fullname}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-gray-400">
                            <span className="font-medium text-gray-500">
                              @{form.username}
                            </span>

                            <span className="text-gray-300">•</span>

                            <span className="truncate">{form.email}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleBack}
                          className="
                            shrink-0
                            rounded-lg
                            border
                            border-gray-200
                            bg-white
                            px-2.5
                            py-1.5
                            text-[9px]
                            font-medium
                            text-gray-500
                            transition-colors
                            hover:border-gray-300
                            hover:bg-gray-50
                            hover:text-gray-900
                          "
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* =============================================
                        ACCOUNT SECTION
                    ============================================= */}

                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        <ShieldCheck size={15} strokeWidth={1.6} />
                      </div>

                      <div>
                        <h3 className="text-[12px] font-semibold text-gray-900">
                          Account details
                        </h3>

                        <p className="mt-0.5 text-[9px] text-gray-400">
                          Configure birthday, role and initial access.
                        </p>
                      </div>
                    </div>

                    {/* BIRTHDAY / ROLE */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <BirthdayPicker
                        value={form.birthday}
                        onChange={handleBirthdayChange}
                        error={errors.birthday}
                      />

                      <RoleSelect
                        value={form.role}
                        onChange={handleRoleChange}
                        error={errors.role}
                      />
                    </div>

                    {/* =============================================
                        PASSWORD
                    ============================================= */}

                    {!editing ? (
                      <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                        <div className="flex items-start gap-3 bg-gray-50/70 p-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                            <KeyRound size={15} strokeWidth={1.6} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold text-gray-900">
                                  Default password
                                </p>

                                <p className="mt-0.5 text-[9px] leading-4 text-gray-400">
                                  Generated automatically from the user's
                                  birthday.
                                </p>
                              </div>

                              {defaultPassword && (
                                <span className="shrink-0 rounded-md bg-black px-2 py-1 text-[8px] font-medium text-white">
                                  Ready
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex gap-2">
                              <div className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-gray-200 bg-white px-3">
                                {defaultPassword ? (
                                  <span className="truncate font-mono text-[12px] font-semibold tracking-[0.05em] text-gray-900">
                                    {defaultPassword}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400">
                                    Select a birthday to generate password
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={handleCopyPassword}
                                disabled={!defaultPassword}
                                aria-label="Copy password"
                                className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-gray-200
                                  bg-white
                                  text-gray-500
                                  transition-all
                                  hover:border-gray-300
                                  hover:bg-gray-100
                                  hover:text-black
                                  disabled:cursor-not-allowed
                                  disabled:opacity-40
                                "
                              >
                                {copied ? (
                                  <Check size={14} strokeWidth={1.8} />
                                ) : (
                                  <Copy size={14} strokeWidth={1.6} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 bg-white px-4 py-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[9px] text-gray-400">
                              Password format:{" "}
                              <span className="font-medium text-gray-600">
                                DATONG + MMDDYYYY
                              </span>
                            </p>

                            <p className="text-[9px] text-gray-400">
                              Change after first login
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm ring-1 ring-gray-200">
                            <KeyRound size={15} strokeWidth={1.6} />
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold text-gray-900">
                              Password unchanged
                            </p>

                            <p className="mt-1 text-[9px] leading-4 text-gray-400">
                              Editing these details will not reset the user's
                              current password.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="sticky bottom-0 z-30 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                {/* LEFT */}

                <div>
                  {currentStep === 1 ? (
                    <p className="hidden text-[9px] text-gray-400 sm:block">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="
                        flex
                        h-9
                        items-center
                        gap-2
                        rounded-lg
                        px-2
                        text-[11px]
                        font-medium
                        text-gray-500
                        transition-colors
                        hover:bg-gray-50
                        hover:text-gray-900
                      "
                    >
                      <ArrowLeft size={13} strokeWidth={1.7} />
                      Back
                    </button>
                  )}
                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-2">
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
                      text-[11px]
                      font-medium
                      text-gray-600
                      transition-colors
                      hover:border-gray-300
                      hover:bg-gray-50
                      hover:text-gray-900
                    "
                  >
                    Cancel
                  </button>

                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="
                        flex
                        h-9
                        items-center
                        gap-2
                        rounded-lg
                        bg-black
                        px-4
                        text-[11px]
                        font-medium
                        text-white
                        transition-colors
                        hover:bg-gray-800
                        focus:outline-none
                        focus:ring-2
                        focus:ring-gray-300
                        focus:ring-offset-2
                      "
                    >
                      Continue
                      <ArrowRight size={13} strokeWidth={1.7} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="
                        flex
                        h-9
                        items-center
                        gap-2
                        rounded-lg
                        bg-black
                        px-4
                        text-[11px]
                        font-medium
                        text-white
                        transition-colors
                        hover:bg-gray-800
                        focus:outline-none
                        focus:ring-2
                        focus:ring-gray-300
                        focus:ring-offset-2
                      "
                    >
                      <Save size={13} strokeWidth={1.7} />

                      {editing ? "Save changes" : "Create user"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}

export default UserFormModal;
