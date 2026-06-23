import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  nome: string;
  email: string;
  status_pagamento: "nao_pagante" | "pagante";
  data_pagamento?: string;
  role: "user" | "admin";
};

type AuthState = {
  user: User | null;
  progress: Record<string, number>; // episodeId -> seconds
  login: (email: string, _password: string) => void;
  register: (nome: string, email: string, _password: string) => void;
  logout: () => void;
  confirmPayment: (metodo: "mpesa" | "emola") => void;
  setProgress: (episodeId: string, seconds: number) => void;
  promoteToAdmin: () => void;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "-");

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      progress: {},
      login: (email) =>
        set({
          user: {
            id: slug(email),
            nome: email.split("@")[0],
            email,
            status_pagamento: "nao_pagante",
            role: email.startsWith("admin") ? "admin" : "user",
          },
        }),
      register: (nome, email) =>
        set({
          user: {
            id: slug(email),
            nome,
            email,
            status_pagamento: "nao_pagante",
            role: "user",
          },
        }),
      logout: () => set({ user: null }),
      confirmPayment: (metodo) =>
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  status_pagamento: "pagante",
                  data_pagamento: new Date().toISOString(),
                },
              }
            : s,
        ),
      setProgress: (episodeId, seconds) =>
        set((s) => ({ progress: { ...s.progress, [episodeId]: seconds } })),
      promoteToAdmin: () =>
        set((s) => (s.user ? { user: { ...s.user, role: "admin" } } : s)),
    }),
    { name: "doramamoz-auth" },
  ),
);
