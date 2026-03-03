import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "@/lib/firebase";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => setState({ user, loading: false, error: null }),
      (error) => setState({ user: null, loading: false, error: error.message }),
    );
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/operation-not-allowed") {
        setState((s) => ({
          ...s,
          error: "Google Sign-In nie jest włączony. Włącz go w Firebase Console → Authentication → Sign-in method, lub użyj trybu gościa.",
        }));
      } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // user closed popup - not an error
      } else {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Login failed",
        }));
      }
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signInWithPopup(auth, facebookProvider);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/operation-not-allowed") {
        setState((s) => ({
          ...s,
          error: "Facebook Sign-In nie jest włączony. Włącz go w Firebase Console → Authentication → Sign-in method, lub użyj trybu gościa.",
        }));
      } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // user closed popup
      } else {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Login failed",
        }));
      }
    }
  }, []);

  const signInAsGuest = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signInAnonymously(auth);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/operation-not-allowed") {
        setState((s) => ({
          ...s,
          error: "Logowanie anonimowe nie jest włączone. Włącz je w Firebase Console → Authentication → Sign-in method → Anonymous.",
        }));
      } else {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Login failed",
        }));
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Sign out failed",
      }));
    }
  }, []);

  return {
    ...state,
    signInWithGoogle,
    signInWithFacebook,
    signInAsGuest,
    signOut,
    isAuthenticated: !!state.user,
  };
}
