"use client";
// src/contexts/AuthContext.tsx

import {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from "react";
import { TOKEN_STORAGE_KEY } from "@/lib/constants";
import type { User } from "@/types";

interface AuthState {
  user:     User | null;
  token:    string | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout:   () => void;
  setUser:  (u: User) => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]   = useState<User | null>(null);
  const [token,   setToken]  = useState<string | null>(null);
  const [loading, setLoad]   = useState(true);

  // Restore session on boot
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!saved) { setLoad(false); return; }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${saved}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u: User) => { setUser(u); setToken(saved); })
      .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
      .finally(() => setLoad(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Falha ao autenticar.");
    }
    const { token: tk, user: u } = await res.json();
    localStorage.setItem(TOKEN_STORAGE_KEY, tk);
    setToken(tk);
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Falha ao criar conta.");
    }
    const { token: tk, user: u } = await res.json();
    localStorage.setItem(TOKEN_STORAGE_KEY, tk);
    setToken(tk);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
