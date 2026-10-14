import { useEffect, useState } from "react";

import {
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import toast from "react-hot-toast";

import { useAuth } from "./AuthContext";

import Ferrofluid from "../components/reactbits/Ferrofluid";

import iconBlack from "../assets/logos/datong_icon_black.webp";
import textLogoBlack from "../assets/logos/datong_text_logo_black.webp";

import iconWhite from "../assets/logos/datong_icon_white.webp";
import textLogoWhite from "../assets/logos/datong_text_logo_white.webp";

/* =========================================================
   REGISTER FORM
========================================================= */

const EMPTY_REGISTER_FORM = {
  fullname: "",
  nickname: "",
  username: "",
  email: "",
  password: "",
};

/* =========================================================
   USERNAME
========================================================= */

function normalizeUsername(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

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
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.76 3.27-8.1Z"
      />

      <path
        fill="#34A853"
        d="M12 23c2.98 0 5.48-.99 7.3-2.68l-3.57-2.77c-.99.66-2.25 1.05-3.73 1.05-2.87 0-5.3-1.94-6.17-4.54H2.14v2.84A11 11 0 0 0 12 23Z"
      />

      <path
        fill="#FBBC05"
        d="M5.83 14.06A6.6 6.6 0 0 1 5.48 12c0-.72.12-1.41.35-2.06V7.1H2.14A11 11 0 0 0 1 12c0 1.77.42 3.44 1.14 4.9l3.69-2.84Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15A10.55 10.55 0 0 0 12 1 11 11 0 0 0 2.14 7.1l3.69 2.84C6.7 7.32 9.13 5.38 12 5.38Z"
      />
    </svg>
  );
}

/* =========================================================
   FIELD ERROR
========================================================= */

function FieldError({ error }) {
  if (!error) {
    return null;
  }

  return (
    <p className="mt-1.5 text-[10px] text-red-500">
      {Array.isArray(error) ? error[0] : error}
    </p>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function AuthDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gray-200" />

      <span className="shrink-0 text-[9px] font-medium text-gray-400">
        or continue with email
      </span>

      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

/* =========================================================
   LOGIN PAGE
========================================================= */

function LoginPage() {
  const { login, registerMember, loginWithGoogle } = useAuth();

  /* =======================================================
     MODE
  ======================================================= */

  const [mode, setMode] = useState("login");

  const registering = mode === "register";

  /* =======================================================
     LOGIN
  ======================================================= */

  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [loginErrors, setLoginErrors] = useState({});

  /* =======================================================
     GOOGLE
  ======================================================= */

  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  /* =======================================================
     REGISTER
  ======================================================= */

  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER_FORM);

  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const [registerErrors, setRegisterErrors] = useState({});

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  useEffect(() => {
    document.title = registering
      ? "Create account | Datong"
      : "Sign in | Datong";
  }, [registering]);

  /* =======================================================
     CHANGE MODE
  ======================================================= */

  const handleModeChange = (nextMode) => {
    if (loginSubmitting || registerSubmitting || googleSubmitting) {
      return;
    }

    setMode(nextMode);

    setLoginErrors({});

    setRegisterErrors({});

    setShowPassword(false);

    setShowRegisterPassword(false);
  };

  /* =======================================================
     GOOGLE LOGIN / SIGNUP

     Firebase determines automatically:

     Existing Google account
     -> login

     New Google account
     -> create Firebase account
     -> Laravel Member sync
  ======================================================= */

  const handleGoogleAuth = async () => {
    if (googleSubmitting) {
      return;
    }

    try {
      setGoogleSubmitting(true);

      await loginWithGoogle();

      toast.success("Welcome to Datong.");
    } catch (error) {
      console.error("Google authentication failed:", error);

      if (
        error?.code === "auth/popup-closed-by-user" ||
        error?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      toast.error(error?.message || "Unable to continue with Google.");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  /* =======================================================
     LOGIN SUBMIT

     The new AuthContext decides which authentication
     system should be used.

     Member email:
     Firebase Auth

     Internal email:
     Laravel fallback

     Internal username:
     Laravel
  ======================================================= */

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (loginSubmitting) {
      return;
    }

    const nextErrors = {};

    if (!identifier.trim()) {
      nextErrors.login = "Email or username is required.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setLoginErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoginSubmitting(true);

      await login({
        login: identifier.trim().toLowerCase(),

        password,

        remember,
      });

      toast.success("Welcome back.");
    } catch (error) {
      console.error("Login failed:", error);

      setLoginErrors(error?.errors || {});

      toast.error(error?.message || "Unable to sign in.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  /* =======================================================
     REGISTER CHANGE
  ======================================================= */

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;

    /* =====================================================
       USERNAME
    ===================================================== */

    if (name === "username") {
      setUsernameManuallyEdited(true);

      setRegisterForm((current) => ({
        ...current,

        username: normalizeUsername(value),
      }));

      setRegisterErrors((current) => ({
        ...current,

        username: "",
      }));

      return;
    }

    /* =====================================================
       FULL NAME
    ===================================================== */

    if (name === "fullname") {
      setRegisterForm((current) => ({
        ...current,

        fullname: value,

        username: usernameManuallyEdited
          ? current.username
          : generateUsername(value),
      }));

      setRegisterErrors((current) => ({
        ...current,

        fullname: "",
      }));

      return;
    }

    /* =====================================================
       NORMAL FIELDS
    ===================================================== */

    setRegisterForm((current) => ({
      ...current,

      [name]: value,
    }));

    if (registerErrors[name]) {
      setRegisterErrors((current) => ({
        ...current,

        [name]: "",
      }));
    }
  };

  /* =======================================================
     REGISTER VALIDATION
  ======================================================= */

  const validateRegistration = () => {
    const nextErrors = {};

    const fullname = registerForm.fullname.trim();

    const nickname = registerForm.nickname.trim();

    const username = registerForm.username.trim().toLowerCase();

    const email = registerForm.email.trim().toLowerCase();

    const registrationPassword = registerForm.password;

    /* ===================================================
         FULL NAME
      =================================================== */

    if (!fullname) {
      nextErrors.fullname = "Full name is required.";
    }

    /* ===================================================
         NICKNAME
      =================================================== */

    if (!nickname) {
      nextErrors.nickname = "Nickname is required.";
    } else if (nickname.length > 50) {
      nextErrors.nickname = "Nickname cannot exceed 50 characters.";
    }

    /* ===================================================
         USERNAME
      =================================================== */

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

    /* ===================================================
         EMAIL
      =================================================== */

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    /* ===================================================
         PASSWORD
      =================================================== */

    if (!registrationPassword) {
      nextErrors.password = "Password is required.";
    } else if (registrationPassword.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setRegisterErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =======================================================
     REGISTER SUBMIT

     1. Firebase creates authentication account
     2. Laravel verifies Firebase ID token
     3. Laravel creates Members record
     4. role = member
     5. User is immediately logged in
  ======================================================= */

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (registerSubmitting) {
      return;
    }

    if (!validateRegistration()) {
      return;
    }

    const profile = {
      fullname: registerForm.fullname.trim(),

      nickname: registerForm.nickname.trim(),

      username: registerForm.username.trim().toLowerCase(),

      email: registerForm.email.trim().toLowerCase(),
    };

    try {
      setRegisterSubmitting(true);

      await registerMember({
        fullname: profile.fullname,

        nickname: profile.nickname,

        username: profile.username,

        email: profile.email,

        password: registerForm.password,
      });

      toast.success("Account created successfully.");

      setRegisterForm(EMPTY_REGISTER_FORM);

      setUsernameManuallyEdited(false);

      /*
       * Do NOT switch back to login.
       *
       * registerMember() already authenticates the
       * Firebase Member and updates AuthContext.
       *
       * App.jsx will automatically leave /login.
       */
    } catch (error) {
      console.error("Registration failed:", error);

      setRegisterErrors(error?.errors || {});

      toast.error(error?.message || "Unable to create account.");

      if (error?.code === "auth/email-already-in-use") {
        setRegisterErrors((current) => ({
          ...current,

          email: "This email address is already registered.",
        }));
      }
    } finally {
      setRegisterSubmitting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="relative hidden min-h-screen overflow-hidden bg-[#050505] text-white lg:block">
          {/* BACKGROUND */}

          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-[#050505]"
          />

          {/* FERROFLUID */}

          <div className="absolute inset-0 z-[1] h-full w-full">
            <Ferrofluid
              colors={["#ffffff", "#ffffff", "#ffffff"]}
              spikeHeight={1}
              sharpness={2.5}
              tilt={48}
              mouseInteraction
              clickPulse
              brightness={1.4}
              scale={1.6}
              turbulence={1}
              fluidity={0.55}
              speed={0.5}
              magnetism={1}
              variation={0}
              flowDirection="down"
              mouseStrength={1}
              mouseRadius={0.22}
              intro
              lightMode={false}
              transparent
              opacity={1}
              className="h-full w-full"
            />
          </div>

          {/* GRADIENT */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-black/55 via-black/20 to-transparent"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/50 via-transparent to-black/60"
          />

          {/* CONTENT */}

          <div className="relative z-10 flex min-h-screen flex-col justify-between px-14 py-12 xl:px-16">
            {/* BRAND */}

            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
              className="flex items-center gap-4"
            >
              <img
                src={iconWhite}
                alt="Datong"
                className="h-[64px] w-[64px] shrink-0 object-contain"
              />

              <img
                src={textLogoWhite}
                alt="Datong"
                className="h-[44px] w-auto max-w-[220px] object-contain"
              />
            </motion.div>

            {/* STATEMENT */}

            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: "easeOut",
              }}
              className="max-w-[540px]"
            >
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/80 backdrop-blur-md">
                Finance with clarity
              </span>

              <h1 className="mt-7 text-[46px] font-semibold leading-[1.08] tracking-[-0.045em] text-white xl:text-[56px]">
                Take control of your money, one step at a time.
              </h1>

              <p className="mt-6 max-w-[460px] text-[15px] leading-7 text-white/60">
                Track transactions, manage budgets and stay focused on what
                matters most.
              </p>
            </motion.div>

            <p className="text-[12px] text-white/45">
              © 2026 Datong. Smart finance made simple.
            </p>
          </div>
        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:bg-[#f7f7f8] lg:px-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="w-full max-w-[430px]"
          >
            {/* =================================================
                MOBILE LOGO
            ================================================= */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img
                src={iconBlack}
                alt="Datong"
                className="h-12 w-12 object-contain"
              />

              <img
                src={textLogoBlack}
                alt="Datong"
                className="h-[32px] w-auto object-contain"
              />
            </div>

            {/* =================================================
                MODE SWITCH
            ================================================= */}

            <div className="mb-7 rounded-xl border border-gray-200 bg-white p-1">
              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  disabled={
                    loginSubmitting || registerSubmitting || googleSubmitting
                  }
                  className={`
                    h-9
                    rounded-lg
                    text-[11px]
                    font-medium
                    transition-all
                    disabled:cursor-not-allowed

                    ${
                      !registering
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("register")}
                  disabled={
                    loginSubmitting || registerSubmitting || googleSubmitting
                  }
                  className={`
                    h-9
                    rounded-lg
                    text-[11px]
                    font-medium
                    transition-all
                    disabled:cursor-not-allowed

                    ${
                      registering
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
                >
                  Register
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {/* =================================================
                  LOGIN
              ================================================= */}

              {!registering && (
                <motion.div
                  key="login"
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -8,
                  }}
                  transition={{
                    duration: 0.17,
                    ease: "easeOut",
                  }}
                >
                  {/* HEADER */}

                  <div className="mb-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      Datong workspace
                    </p>

                    <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.045em] text-gray-950">
                      Welcome back
                    </h2>

                    <p className="mt-2 text-[11px] leading-5 text-gray-400">
                      Sign in to continue to your account.
                    </p>
                  </div>

                  {/* =================================================
                      GOOGLE
                  ================================================= */}

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleSubmitting || loginSubmitting}
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-lg
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-[11px]
                      font-medium
                      text-gray-700
                      transition-all
                      hover:border-gray-300
                      hover:bg-gray-50
                      hover:text-gray-950
                      focus:outline-none
                      focus:ring-2
                      focus:ring-gray-100
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {googleSubmitting ? (
                      <LoaderCircle
                        size={15}
                        strokeWidth={1.7}
                        className="animate-spin"
                      />
                    ) : (
                      <GoogleIcon />
                    )}

                    {googleSubmitting
                      ? "Connecting..."
                      : "Continue with Google"}
                  </button>

                  {/* DIVIDER */}

                  <div className="my-5">
                    <AuthDivider />
                  </div>

                  {/* =================================================
                      LOGIN FORM
                  ================================================= */}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* LOGIN */}

                    <div>
                      <label
                        htmlFor="login-identifier"
                        className="mb-1.5 block text-[11px] font-medium text-gray-700"
                      >
                        Email or username
                      </label>

                      <div className="relative">
                        <UserRound
                          size={15}
                          strokeWidth={1.5}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id="login-identifier"
                          type="text"
                          value={identifier}
                          onChange={(event) => {
                            setIdentifier(event.target.value);

                            if (loginErrors.login) {
                              setLoginErrors((current) => ({
                                ...current,

                                login: "",
                              }));
                            }
                          }}
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                          autoFocus
                          placeholder="Email or username"
                          className={`
                            h-11
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
                              loginErrors.login
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            }
                          `}
                        />
                      </div>

                      <FieldError error={loginErrors.login} />
                    </div>

                    {/* PASSWORD */}

                    <div>
                      <label
                        htmlFor="login-password"
                        className="mb-1.5 block text-[11px] font-medium text-gray-700"
                      >
                        Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={15}
                          strokeWidth={1.5}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);

                            if (loginErrors.password) {
                              setLoginErrors((current) => ({
                                ...current,

                                password: "",
                              }));
                            }
                          }}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className={`
                            h-11
                            w-full
                            rounded-lg
                            border
                            bg-white
                            pl-10
                            pr-11
                            text-[12px]
                            text-gray-900
                            outline-none
                            transition-all
                            placeholder:text-gray-400

                            ${
                              loginErrors.password
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            }
                          `}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff size={15} strokeWidth={1.5} />
                          ) : (
                            <Eye size={15} strokeWidth={1.5} />
                          )}
                        </button>
                      </div>

                      <FieldError error={loginErrors.password} />
                    </div>

                    {/* REMEMBER */}

                    <label className="flex cursor-pointer items-center gap-2.5 text-[10px] text-gray-500">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 accent-black"
                      />
                      Keep me signed in
                    </label>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={loginSubmitting || googleSubmitting}
                      className="
                        mt-2
                        flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-black
                        px-4
                        text-[11px]
                        font-medium
                        text-white
                        transition-all
                        hover:bg-gray-800
                        focus:outline-none
                        focus:ring-2
                        focus:ring-gray-300
                        focus:ring-offset-2
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {loginSubmitting ? (
                        <>
                          <LoaderCircle
                            size={15}
                            strokeWidth={1.7}
                            className="animate-spin"
                          />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight size={14} strokeWidth={1.7} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* =================================================
                  REGISTER
              ================================================= */}

              {registering && (
                <motion.div
                  key="register"
                  initial={{
                    opacity: 0,
                    x: 8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 8,
                  }}
                  transition={{
                    duration: 0.17,
                    ease: "easeOut",
                  }}
                >
                  {/* HEADER */}

                  <div className="mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      Create account
                    </p>

                    <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.045em] text-gray-950">
                      Join Datong
                    </h2>

                    <p className="mt-2 text-[11px] leading-5 text-gray-400">
                      Create your account and complete your profile later.
                    </p>
                  </div>

                  {/* =================================================
                      GOOGLE REGISTER
                  ================================================= */}

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleSubmitting || registerSubmitting}
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-lg
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-[11px]
                      font-medium
                      text-gray-700
                      transition-all
                      hover:border-gray-300
                      hover:bg-gray-50
                      hover:text-gray-950
                      focus:outline-none
                      focus:ring-2
                      focus:ring-gray-100
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {googleSubmitting ? (
                      <LoaderCircle
                        size={15}
                        strokeWidth={1.7}
                        className="animate-spin"
                      />
                    ) : (
                      <GoogleIcon />
                    )}

                    {googleSubmitting
                      ? "Connecting..."
                      : "Continue with Google"}
                  </button>

                  {/* DIVIDER */}

                  <div className="my-5">
                    <AuthDivider />
                  </div>

                  {/* =================================================
                      REGISTER FORM
                  ================================================= */}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* =================================================
                        FULL NAME / NICKNAME
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {/* FULL NAME */}

                      <div>
                        <label
                          htmlFor="register-fullname"
                          className="mb-1.5 block text-[11px] font-medium text-gray-700"
                        >
                          Full name
                        </label>

                        <div className="relative">
                          <UserRound
                            size={14}
                            strokeWidth={1.5}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            id="register-fullname"
                            type="text"
                            name="fullname"
                            value={registerForm.fullname}
                            onChange={handleRegisterChange}
                            autoComplete="name"
                            autoFocus
                            placeholder="Full name"
                            className={`
                              h-11
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
                                registerErrors.fullname
                                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                  : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                              }
                            `}
                          />
                        </div>

                        <FieldError error={registerErrors.fullname} />
                      </div>

                      {/* NICKNAME */}

                      <div>
                        <label
                          htmlFor="register-nickname"
                          className="mb-1.5 block text-[11px] font-medium text-gray-700"
                        >
                          Nickname
                        </label>

                        <div className="relative">
                          <UsersRound
                            size={14}
                            strokeWidth={1.5}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            id="register-nickname"
                            type="text"
                            name="nickname"
                            value={registerForm.nickname}
                            onChange={handleRegisterChange}
                            autoComplete="nickname"
                            placeholder="Nickname"
                            className={`
                              h-11
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
                                registerErrors.nickname
                                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                  : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                              }
                            `}
                          />
                        </div>

                        <FieldError error={registerErrors.nickname} />
                      </div>
                    </div>

                    {/* =================================================
                        USERNAME
                    ================================================= */}

                    <div>
                      <label
                        htmlFor="register-username"
                        className="mb-1.5 block text-[11px] font-medium text-gray-700"
                      >
                        Username
                      </label>

                      <div className="relative">
                        <AtSign
                          size={14}
                          strokeWidth={1.5}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id="register-username"
                          type="text"
                          name="username"
                          value={registerForm.username}
                          onChange={handleRegisterChange}
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="your.username"
                          className={`
                            h-11
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
                              registerErrors.username
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            }
                          `}
                        />
                      </div>

                      <FieldError error={registerErrors.username} />
                    </div>

                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <div>
                      <label
                        htmlFor="register-email"
                        className="mb-1.5 block text-[11px] font-medium text-gray-700"
                      >
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={14}
                          strokeWidth={1.5}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id="register-email"
                          type="email"
                          name="email"
                          value={registerForm.email}
                          onChange={handleRegisterChange}
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="name@example.com"
                          className={`
                            h-11
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
                              registerErrors.email
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            }
                          `}
                        />
                      </div>

                      <FieldError error={registerErrors.email} />
                    </div>

                    {/* =================================================
                        PASSWORD
                    ================================================= */}

                    <div>
                      <label
                        htmlFor="register-password"
                        className="mb-1.5 block text-[11px] font-medium text-gray-700"
                      >
                        Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={14}
                          strokeWidth={1.5}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id="register-password"
                          type={showRegisterPassword ? "text" : "password"}
                          name="password"
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                          autoComplete="new-password"
                          placeholder="Create password"
                          className={`
                            h-11
                            w-full
                            rounded-lg
                            border
                            bg-white
                            pl-10
                            pr-11
                            text-[12px]
                            text-gray-900
                            outline-none
                            transition-all
                            placeholder:text-gray-400

                            ${
                              registerErrors.password
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                            }
                          `}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword((current) => !current)
                          }
                          aria-label={
                            showRegisterPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          {showRegisterPassword ? (
                            <EyeOff size={15} strokeWidth={1.5} />
                          ) : (
                            <Eye size={15} strokeWidth={1.5} />
                          )}
                        </button>
                      </div>

                      <FieldError error={registerErrors.password} />
                    </div>

                    {/* =================================================
                        CREATE ACCOUNT
                    ================================================= */}

                    <button
                      type="submit"
                      disabled={registerSubmitting || googleSubmitting}
                      className="
                        mt-1
                        flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-black
                        px-4
                        text-[11px]
                        font-medium
                        text-white
                        transition-all
                        hover:bg-gray-800
                        focus:outline-none
                        focus:ring-2
                        focus:ring-gray-300
                        focus:ring-offset-2
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {registerSubmitting ? (
                        <>
                          <LoaderCircle
                            size={15}
                            strokeWidth={1.7}
                            className="animate-spin"
                          />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight size={14} strokeWidth={1.7} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="mt-7 border-t border-gray-200 pt-5">
              <div className="flex items-center gap-2 text-[9px] leading-4 text-gray-400">
                <ShieldCheck size={12} strokeWidth={1.5} className="shrink-0" />
                Authentication is securely handled by Datong and Firebase.
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
