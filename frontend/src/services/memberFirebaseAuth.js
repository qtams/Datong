import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { firebaseAuth, googleProvider } from "../lib/firebase";

/* =========================================================
   FIREBASE ERROR MESSAGES
========================================================= */

const FIREBASE_ERROR_MESSAGES = {
  "auth/email-already-in-use": "This email address is already registered.",

  "auth/invalid-email": "Please enter a valid email address.",

  "auth/weak-password":
    "Your password does not meet the required security level.",

  "auth/missing-password": "Password is required.",

  "auth/user-not-found": "No account was found with these credentials.",

  "auth/wrong-password": "Incorrect email or password.",

  "auth/invalid-credential": "Incorrect email or password.",

  /* =======================================================
     FIREBASE PROVIDER NOT ENABLED
  ======================================================= */

  "auth/operation-not-allowed":
    "Email/password authentication is disabled in Firebase. Enable Email/Password under Firebase Authentication > Sign-in method.",

  "auth/admin-restricted-operation":
    "Account creation is currently disabled in Firebase Authentication settings.",

  /* =======================================================
     FIREBASE PROJECT / CONFIG
  ======================================================= */

  "auth/configuration-not-found":
    "Firebase Authentication is not configured correctly for this project.",

  "auth/invalid-api-key":
    "The Firebase API key is invalid. Check your VITE_FIREBASE_API_KEY.",

  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    "The Firebase API key is invalid. Check your Firebase web configuration.",

  "auth/app-not-authorized":
    "This website is not authorized to use the configured Firebase project.",

  /* =======================================================
     GOOGLE
  ======================================================= */

  "auth/popup-closed-by-user": "Google sign-in was cancelled.",

  "auth/popup-blocked": "Your browser blocked the Google sign-in window.",

  "auth/cancelled-popup-request": "Google sign-in was cancelled.",

  "auth/account-exists-with-different-credential":
    "An account already exists with this email using another sign-in method.",

  "auth/unauthorized-domain":
    "This website is not authorized for Firebase Authentication. Add the domain under Firebase Authentication > Settings > Authorized domains.",

  /* =======================================================
     NETWORK / RATE LIMIT
  ======================================================= */

  "auth/network-request-failed":
    "Unable to connect to Firebase. Check your internet connection.",

  "auth/too-many-requests":
    "Too many authentication attempts. Please try again later.",
};

/* =========================================================
   NORMALIZE FIREBASE ERROR
========================================================= */

function normalizeFirebaseError(error) {
  const code = error?.code || "";

  console.error("[Firebase Auth Error]", {
    code,

    message: error?.message,

    name: error?.name,

    customData: error?.customData,
  });

  const normalized = new Error(
    FIREBASE_ERROR_MESSAGES[code] || error?.message || "Authentication failed.",
  );

  normalized.code = code;

  normalized.original = error;

  return normalized;
}

/* =========================================================
   EMAIL SIGNUP
========================================================= */

export async function signupMemberWithEmail({
  email,
  password,
  fullname = "",
}) {
  try {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      const error = new Error("Email address is required.");

      error.code = "auth/invalid-email";

      throw error;
    }

    if (!password) {
      const error = new Error("Password is required.");

      error.code = "auth/missing-password";

      throw error;
    }

    /* =====================================================
       CREATE FIREBASE USER
    ===================================================== */

    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      normalizedEmail,
      password,
    );

    const user = credential.user;

    /* =====================================================
       DISPLAY NAME
    ===================================================== */

    const displayName = String(fullname || "").trim();

    if (displayName) {
      await updateProfile(user, {
        displayName,
      });
    }

    /* =====================================================
       ID TOKEN

       This will be sent to Laravel in the next step.
    ===================================================== */

    const idToken = await user.getIdToken(true);

    return {
      user,

      idToken,

      isNewUser: true,

      provider: "password",
    };
  } catch (error) {
    /*
     * Errors created locally above
     * still use Firebase-style codes.
     */

    throw normalizeFirebaseError(error);
  }
}

/* =========================================================
   EMAIL LOGIN
========================================================= */

export async function loginMemberWithEmail({ email, password }) {
  try {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      normalizedEmail,
      password,
    );

    const user = credential.user;

    const idToken = await user.getIdToken();

    return {
      user,

      idToken,

      isNewUser: false,

      provider: "password",
    };
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

/* =========================================================
   GOOGLE LOGIN / SIGNUP

   Same button supports:
   - new Google account -> signup
   - existing Google account -> login
========================================================= */

export async function loginMemberWithGoogle() {
  try {
    const credential = await signInWithPopup(firebaseAuth, googleProvider);

    const user = credential.user;

    const idToken = await user.getIdToken(true);

    return {
      user,

      idToken,

      provider: "google",
    };
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

/* =========================================================
   CURRENT FIREBASE MEMBER
========================================================= */

export function getCurrentFirebaseMember() {
  return firebaseAuth.currentUser;
}

/* =========================================================
   FIREBASE ID TOKEN

   Laravel will verify this token.
========================================================= */

export async function getMemberIdToken(forceRefresh = false) {
  const user = firebaseAuth.currentUser;

  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

/* =========================================================
   FIREBASE LOGOUT
========================================================= */

export async function logoutFirebaseMember() {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}
