"use client";

// Client Component: React Context only works in the browser tree. The server layout
// reads the verified session once and passes it in as `user`, so interactive
// components (navigation, forms) read identity via useAuth() without prop drilling
// or refetching. This is display state only: every Server Action re-checks the
// session on the server and never trusts anything held in this context.
import { createContext, useContext, type ReactNode } from "react";

export type AuthUser = { id: string; name: string; email: string; role: "USER" | "ADMIN" };

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({ user, children }: { user: AuthUser | null; children: ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
