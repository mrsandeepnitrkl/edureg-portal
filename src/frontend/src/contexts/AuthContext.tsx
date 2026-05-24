import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export type UserRole = "admin" | "student" | null;

export interface AuthState {
  role: UserRole;
  userId: string | null;
  token: string | null;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  adminLogin: (
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  studentLogin: (
    enrollmentId: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function parseToken(token: string): { role: UserRole; userId: string } | null {
  try {
    const parts = token.split(":");
    if (parts.length < 3) return null;
    const role = parts[0] as UserRole;
    const userId = parts[1];
    if (role !== "admin" && role !== "student") return null;
    return { role, userId };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor(createActor);

  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem("auth_token");
    if (stored) {
      const parsed = parseToken(stored);
      if (parsed) {
        return {
          role: parsed.role,
          userId: parsed.userId,
          token: stored,
          isLoading: false,
        };
      }
    }
    return { role: null, userId: null, token: null, isLoading: false };
  });

  useEffect(() => {
    const stored = localStorage.getItem("auth_token");
    if (stored && !state.token) {
      const parsed = parseToken(stored);
      if (parsed) {
        setState({
          role: parsed.role,
          userId: parsed.userId,
          token: stored,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }, [state.token]);

  const adminLogin = useCallback(
    async (password: string) => {
      if (!actor) return { success: false, error: "Backend not ready" };
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const result = await actor.adminLogin(password);
        if (result.__kind__ === "ok") {
          const token = result.ok;
          const parsed = parseToken(token);
          if (parsed) {
            localStorage.setItem("auth_token", token);
            setState({
              role: parsed.role,
              userId: parsed.userId,
              token,
              isLoading: false,
            });
            return { success: true };
          }
          setState((s) => ({ ...s, isLoading: false }));
          return { success: false, error: "Invalid token received" };
        }
        setState((s) => ({ ...s, isLoading: false }));
        return { success: false, error: result.err };
      } catch (_e) {
        setState((s) => ({ ...s, isLoading: false }));
        return { success: false, error: "Login failed. Please try again." };
      }
    },
    [actor],
  );

  const studentLogin = useCallback(
    async (enrollmentId: string, password: string) => {
      if (!actor) return { success: false, error: "Backend not ready" };
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const result = await actor.studentLogin(enrollmentId, password);
        if (result.__kind__ === "ok") {
          const token = result.ok;
          const parsed = parseToken(token);
          if (parsed) {
            localStorage.setItem("auth_token", token);
            setState({
              role: parsed.role,
              userId: parsed.userId,
              token,
              isLoading: false,
            });
            return { success: true };
          }
          setState((s) => ({ ...s, isLoading: false }));
          return { success: false, error: "Invalid token received" };
        }
        setState((s) => ({ ...s, isLoading: false }));
        return { success: false, error: result.err };
      } catch (_e) {
        setState((s) => ({ ...s, isLoading: false }));
        return { success: false, error: "Login failed. Please try again." };
      }
    },
    [actor],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setState({ role: null, userId: null, token: null, isLoading: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, adminLogin, studentLogin, logout }),
    [state, adminLogin, studentLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
