import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import { useLocation } from "react-router-dom";

import { firebaseAuth } from "../lib/firebase";

import { getCurrentUser, loginUser, logoutUser } from "../services/authApi";

import {
  loginMemberWithEmail,
  loginMemberWithGoogle,
  logoutFirebaseMember,
  signupMemberWithEmail,
} from "../services/memberFirebaseAuth";

import { getCurrentMember, syncMember } from "../services/memberAuthApi";

/* =========================================================
   CONTEXT
========================================================= */

const AuthContext = createContext(null);

/* =========================================================
   FIREBASE READY
========================================================= */

function waitForFirebaseAuth() {
  return new Promise((resolve) => {
    let unsubscribe = () => {};

    unsubscribe = onAuthStateChanged(
      firebaseAuth,

      (firebaseUser) => {
        unsubscribe();

        resolve(firebaseUser);
      },

      () => {
        unsubscribe();

        resolve(null);
      },
    );
  });
}

/* =========================================================
   FIREBASE CREDENTIAL ERROR
========================================================= */

function isFirebaseCredentialError(error) {
  return [
    "auth/invalid-credential",
    "auth/user-not-found",
    "auth/wrong-password",
  ].includes(error?.code);
}

/* =========================================================
   PROVIDER
========================================================= */

export function AuthProvider({ children }) {
  const location = useLocation();

  const initialPath = useRef(location.pathname);

  const [user, setUser] = useState(null);

  const [authType, setAuthType] = useState(null);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     SET MEMBER
  ======================================================= */

  const applyMember = useCallback((member) => {
    const normalized = {
      ...member,

      role: member?.role || "member",

      auth_type: "member",
    };

    setUser(normalized);

    setAuthType("member");

    return normalized;
  }, []);

  /* =======================================================
     SET INTERNAL USER
  ======================================================= */

  const applyInternalUser = useCallback((internalUser) => {
    if (!internalUser) {
      setUser(null);

      setAuthType(null);

      return null;
    }

    const normalized = {
      ...internalUser,

      auth_type: "internal",
    };

    setUser(normalized);

    setAuthType("internal");

    return normalized;
  }, []);

  /* =======================================================
     INITIAL AUTH RESTORE
  ======================================================= */

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        /*
         * Firebase first.
         */

        const firebaseUser = await waitForFirebaseAuth();

        if (!active) {
          return;
        }

        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();

          let member;

          try {
            member = await getCurrentMember(token);
          } catch (error) {
            /*
             * Firebase account exists but
             * Laravel member hasn't been
             * synced yet.
             */

            if (error.status === 404) {
              member = await syncMember({}, token);
            } else {
              throw error;
            }
          }

          if (active) {
            applyMember(member);
          }

          return;
        }

        /*
         * On /login there is no reason to
         * call Laravel /auth/me for a guest.
         */

        if (initialPath.current === "/login") {
          return;
        }

        const internalUser = await getCurrentUser();

        if (active && internalUser) {
          applyInternalUser(internalUser);
        }
      } catch (error) {
        console.error("Unable to restore authentication:", error);

        if (active) {
          setUser(null);

          setAuthType(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restore();

    return () => {
      active = false;
    };
  }, [applyInternalUser, applyMember]);

  /* =======================================================
     LOGIN

     EMAIL:
     1. Try Firebase Member
     2. If Firebase doesn't recognize it, try internal Laravel

     USERNAME:
     Internal Laravel login

     Member username login will be added separately because
     Firebase password authentication is email based.
  ======================================================= */

  const login = useCallback(
    async ({ login: identifier, password, remember }) => {
      const normalizedIdentifier = String(identifier || "")
        .trim()
        .toLowerCase();

      let firebaseError = null;

      /* =================================================
           EMAIL -> TRY MEMBER FIRST
        ================================================= */

      if (normalizedIdentifier.includes("@")) {
        try {
          const credential = await loginMemberWithEmail({
            email: normalizedIdentifier,

            password,
          });

          let pendingProfile = {};

          try {
            const stored = window.sessionStorage.getItem(
              "datong_pending_member_profile",
            );

            if (stored) {
              pendingProfile = JSON.parse(stored);
            }
          } catch {
            pendingProfile = {};
          }

          const member = await syncMember(pendingProfile, credential.idToken);

          window.sessionStorage.removeItem("datong_pending_member_profile");

          return {
            user: applyMember(member),

            auth_type: "member",
          };
        } catch (error) {
          firebaseError = error;

          /*
           * Only fall back to Laravel if
           * Firebase says the credentials
           * are not a Firebase member.
           */

          if (!isFirebaseCredentialError(error)) {
            throw error;
          }
        }
      }

      /* =================================================
           INTERNAL LARAVEL USER
        ================================================= */

      try {
        /*
         * Avoid an old Firebase session
         * taking priority over an internal
         * admin login.
         */

        if (firebaseAuth.currentUser) {
          await logoutFirebaseMember();
        }

        const response = await loginUser({
          login: normalizedIdentifier,

          password,

          remember,
        });

        return {
          ...response,

          user: applyInternalUser(response.user),

          auth_type: "internal",
        };
      } catch (error) {
        /*
         * If email was tried against Firebase
         * first, return the Firebase error.
         */

        if (firebaseError) {
          throw firebaseError;
        }

        throw error;
      }
    },
    [applyInternalUser, applyMember],
  );

  /* =======================================================
     REGISTER MEMBER
  ======================================================= */

  const registerMember = useCallback(
    async ({ fullname, nickname, username, email, password }) => {
      const credential = await signupMemberWithEmail({
        fullname,

        email,

        password,
      });

      const member = await syncMember(
        {
          fullname,

          nickname,

          username,
        },
        credential.idToken,
      );

      return {
        user: applyMember(member),

        auth_type: "member",
      };
    },
    [applyMember],
  );

  /* =======================================================
     GOOGLE MEMBER LOGIN / SIGNUP
  ======================================================= */

  const loginWithGoogle = useCallback(async () => {
    const credential = await loginMemberWithGoogle();

    const member = await syncMember({}, credential.idToken);

    return {
      user: applyMember(member),

      auth_type: "member",
    };
  }, [applyMember]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = useCallback(async () => {
    try {
      if (authType === "member") {
        await logoutFirebaseMember();
      } else if (authType === "internal") {
        await logoutUser();
      }
    } finally {
      setUser(null);

      setAuthType(null);
    }
  }, [authType]);

  /* =======================================================
     REFRESH USER
  ======================================================= */

  const refreshUser = useCallback(async () => {
    if (authType === "member") {
      const member = await getCurrentMember();

      return applyMember(member);
    }

    if (authType === "internal") {
      const internalUser = await getCurrentUser();

      return applyInternalUser(internalUser);
    }

    return null;
  }, [authType, applyInternalUser, applyMember]);

  /* =======================================================
     VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      user,

      loading,

      authType,

      authenticated: Boolean(user),

      isMember: authType === "member",

      isInternalUser: authType === "internal",

      login,

      registerMember,

      loginWithGoogle,

      logout,

      refreshUser,
    }),
    [
      user,
      loading,
      authType,
      login,
      registerMember,
      loginWithGoogle,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* =========================================================
   HOOK
========================================================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export default AuthContext;
