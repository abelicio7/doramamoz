import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

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
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  progress: Record<string, number>; // episodeId -> seconds

  init: () => () => void;
  hydrateUser: (session: Session | null) => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (nome: string, email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  confirmPayment: (metodo: "mpesa" | "emola", telefone: string) => Promise<{ error?: string }>;
  setProgress: (episodeId: string, seconds: number) => void;
  promoteToAdmin: () => Promise<{ error?: string }>;
  refresh: () => Promise<void>;
};

// Throttle progress writes to DB (avoid hammering on timeupdate)
const lastSaved: Record<string, number> = {};

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,
  progress: {},

  init: () => {
    // Set up listener FIRST (sync), then check existing session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      // Defer DB calls to avoid deadlock per Supabase guidance
      setTimeout(() => {
        void get().hydrateUser(session);
      }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, initialized: true });
      void get().hydrateUser(data.session);
    });

    return () => sub.subscription.unsubscribe();
  },

  hydrateUser: async (session) => {
    if (!session?.user) {
      set({ user: null, progress: {} });
      return;
    }
    const uid = session.user.id;
    const [{ data: profile }, { data: roles }, { data: progRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("watch_progress").select("episode_id, seconds").eq("user_id", uid),
    ]);

    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    set({
      user: profile
        ? {
            id: profile.id,
            nome: profile.nome,
            email: profile.email,
            status_pagamento: profile.status_pagamento as "nao_pagante" | "pagante",
            data_pagamento: profile.data_pagamento ?? undefined,
            role: isAdmin ? "admin" : "user",
          }
        : {
            id: uid,
            nome: session.user.email?.split("@")[0] ?? "Utilizador",
            email: session.user.email ?? "",
            status_pagamento: "nao_pagante",
            role: isAdmin ? "admin" : "user",
          },
      progress: Object.fromEntries((progRows ?? []).map((r) => [r.episode_id, r.seconds])),
    });
  },

  refresh: async () => {
    const { data } = await supabase.auth.getSession();
    await get().hydrateUser(data.session);
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  },

  register: async (nome, email, password) => {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome }, emailRedirectTo: redirectTo },
    });
    return error ? { error: error.message } : {};
  },

  loginWithGoogle: async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
      });
      if (result.error) return { error: (result.error as Error).message ?? "Erro Google" };
      return {};
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erro Google" };
    }
  },

  resetPassword: async (email) => {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return error ? { error: error.message } : {};
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, progress: {} });
  },

  confirmPayment: async (metodo, telefone) => {
    const user = get().user;
    if (!user) return { error: "Não autenticado" };

    const { error: payErr } = await supabase.from("payments").insert({
      user_id: user.id,
      metodo,
      valor_mt: 60,
      telefone,
      status: "confirmado",
    });
    if (payErr) return { error: payErr.message };

    const data_pagamento = new Date().toISOString();
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ status_pagamento: "pagante", data_pagamento })
      .eq("id", user.id);
    if (profErr) return { error: profErr.message };

    set({
      user: { ...user, status_pagamento: "pagante", data_pagamento },
    });
    return {};
  },

  setProgress: (episodeId, seconds) => {
    set((s) => ({ progress: { ...s.progress, [episodeId]: seconds } }));
    const user = get().user;
    if (!user) return;
    const now = Date.now();
    if (lastSaved[episodeId] && now - lastSaved[episodeId] < 5000) return;
    lastSaved[episodeId] = now;
    void supabase
      .from("watch_progress")
      .upsert(
        { user_id: user.id, episode_id: episodeId, seconds: Math.floor(seconds) },
        { onConflict: "user_id,episode_id" },
      );
  },

  promoteToAdmin: async () => {
    const user = get().user;
    if (!user) return { error: "Não autenticado" };
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "admin" });
    if (error && !error.message.includes("duplicate")) return { error: error.message };
    set({ user: { ...user, role: "admin" } });
    return {};
  },
}));
