import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
import { doramasQuery, type Dorama } from "@/data/doramas";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown,
  Plus,
  Trash2,
  Users,
  Film,
  ShieldCheck,
  Pencil,
  X,
  Save,
  ListVideo,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type EpisodeRow = {
  id: string;
  dorama_id: string;
  ordem: number;
  titulo: string;
  duracao: string;
  video_url: string;
};

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · DoramaMoz" }] }),
  component: AdminPage,
});

function AdminPage() {
  const user = useAuth((s) => s.user);
  const promote = useAuth((s) => s.promoteToAdmin);
  const navigate = useNavigate();
  const [tab, setTab] = useState<"doramas" | "users">("doramas");

  useEffect(() => {
    if (user === null) navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [user, navigate]);

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl font-bold">Sem permissão</h1>
        <p className="mt-3 text-muted-foreground">Esta área é restrita a administradores.</p>
        <button
          type="button"
          onClick={() => void promote()}
          className="mt-6 rounded-full border border-border bg-surface px-5 py-2.5 text-sm"
        >
          (DEMO) Promover-me a admin
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3 w-3" /> Admin
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Painel administrativo</h1>
        </div>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
      </div>

      <div className="inline-flex rounded-full bg-surface p-1">
        {([
          { v: "doramas", label: "Doramas", icon: Film },
          { v: "users", label: "Utilizadores", icon: Users },
        ] as const).map(({ v, label, icon: Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "doramas" && <DoramasTab />}
      {tab === "users" && <UsersTab />}
    </div>
  );
}

// --------------------------- DORAMAS TAB ---------------------------

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function DoramasTab() {
  const qc = useQueryClient();
  const { data: doramas } = useSuspenseQuery(doramasQuery);
  const [editing, setEditing] = useState<Dorama | null>(null);
  const [creating, setCreating] = useState(false);
  const [managingEps, setManagingEps] = useState<Dorama | null>(null);

  const deleteM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doramas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doramas"] }),
  });

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> Adicionar dorama
      </button>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Dorama</th>
              <th className="px-4 py-3 hidden sm:table-cell">Categoria</th>
              <th className="px-4 py-3 hidden md:table-cell">Episódios</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 hidden md:table-cell">Destaque</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody>
            {doramas.map((d) => (
              <tr key={d.id} className="border-t border-border bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={d.capa} alt="" className="h-12 w-9 rounded object-cover" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{d.titulo}</div>
                      <div className="truncate text-xs text-muted-foreground">{d.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{d.categoria}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {d.episodios.length}/{d.episodios_count}
                </td>
                <td className="px-4 py-3">{d.rating.toFixed(1)}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {d.destaque ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">Sim</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(d)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      disabled={deleteM.isPending}
                      onClick={() => {
                        if (confirm(`Eliminar "${d.titulo}"?`)) deleteM.mutate(d.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {doramas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Ainda não há doramas. Clique em <strong>Adicionar dorama</strong>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <DoramaEditor
          dorama={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

type FormState = {
  slug: string;
  titulo: string;
  descricao: string;
  sinopse: string;
  capa: string;
  hero: string;
  categoria: string;
  ano: number;
  episodios_count: number;
  rating: number;
  destaque: boolean;
  ordem: number;
};

function DoramaEditor({ dorama, onClose }: { dorama: Dorama | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isNew = !dorama;
  const [form, setForm] = useState<FormState>({
    slug: dorama?.slug ?? "",
    titulo: dorama?.titulo ?? "",
    descricao: dorama?.descricao ?? "",
    sinopse: dorama?.sinopse ?? "",
    capa: dorama?.capa ?? "",
    hero: dorama?.hero ?? "",
    categoria: dorama?.categoria ?? "Romance",
    ano: dorama?.ano ?? new Date().getFullYear(),
    episodios_count: dorama?.episodios_count ?? 0,
    rating: dorama?.rating ?? 8.0,
    destaque: dorama?.destaque ?? false,
    ordem: dorama?.ordem ?? 99,
  });
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.titulo),
        hero: form.hero || null,
      };
      if (isNew) {
        const { data, error } = await supabase
          .from("doramas")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        // Auto-generate episode rows for the requested count
        if (form.episodios_count > 0) {
          const rows = Array.from({ length: form.episodios_count }, (_, i) => ({
            dorama_id: data.id,
            ordem: i + 1,
            titulo: `Episódio ${i + 1}`,
            duracao: "40 min",
            video_url:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          }));
          const { error: epErr } = await supabase.from("episodes").insert(rows);
          if (epErr) throw epErr;
        }
      } else {
        const { error } = await supabase.from("doramas").update(payload).eq("id", dorama!.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doramas"] });
      onClose();
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Erro ao guardar"),
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-border bg-surface-elevated shadow-glow">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface-elevated/95 px-6 py-4 backdrop-blur">
          <h2 className="font-display text-xl font-bold">
            {isNew ? "Novo dorama" : `Editar: ${dorama?.titulo}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            save.mutate();
          }}
          className="space-y-4 px-6 py-5"
        >
          <Field label="Título">
            <input
              type="text"
              required
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              onBlur={() => !form.slug && set("slug", slugify(form.titulo))}
              className="input"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug (URL)">
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => set("slug", slugify(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Categoria">
              <input
                type="text"
                required
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Descrição curta">
            <textarea
              required
              rows={2}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Sinopse">
            <textarea
              rows={4}
              value={form.sinopse}
              onChange={(e) => set("sinopse", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="URL da capa (vertical 2:3)">
            <input
              type="text"
              required
              value={form.capa}
              onChange={(e) => set("capa", e.target.value)}
              className="input"
              placeholder="https://... ou /__l5e/assets-v1/..."
            />
            {form.capa && (
              <img
                src={form.capa}
                alt=""
                className="mt-2 h-32 w-24 rounded-lg object-cover"
              />
            )}
          </Field>

          <Field label="URL do banner (16:9 — opcional, usa capa se vazio)">
            <input
              type="text"
              value={form.hero}
              onChange={(e) => set("hero", e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Ano">
              <input
                type="number"
                required
                value={form.ano}
                onChange={(e) => set("ano", parseInt(e.target.value) || 0)}
                className="input"
              />
            </Field>
            <Field label="Nº episódios">
              <input
                type="number"
                min={0}
                value={form.episodios_count}
                onChange={(e) => set("episodios_count", parseInt(e.target.value) || 0)}
                className="input"
                disabled={!isNew}
              />
              {!isNew && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Para editar episódios, use uma futura versão.
                </p>
              )}
            </Field>
            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                min={0}
                max={10}
                value={form.rating}
                onChange={(e) => set("rating", parseFloat(e.target.value) || 0)}
                className="input"
              />
            </Field>
            <Field label="Ordem">
              <input
                type="number"
                value={form.ordem}
                onChange={(e) => set("ordem", parseInt(e.target.value) || 0)}
                className="input"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => set("destaque", e.target.checked)}
            />
            Mostrar em destaque na home
          </label>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {save.isPending ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

// --------------------------- USERS TAB ---------------------------

type ProfileRow = {
  id: string;
  nome: string;
  email: string;
  status_pagamento: "nao_pagante" | "pagante";
  data_pagamento: string | null;
};

function UsersTab() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async (): Promise<ProfileRow[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, email, status_pagamento, data_pagamento")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (u: ProfileRow) => {
      const novo = u.status_pagamento === "pagante" ? "nao_pagante" : "pagante";
      const { error } = await supabase
        .from("profiles")
        .update({
          status_pagamento: novo,
          data_pagamento: novo === "pagante" ? new Date().toISOString() : null,
        })
        .eq("id", u.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "profiles"] }),
  });

  if (isLoading) {
    return <div className="mt-6 text-sm text-muted-foreground">A carregar utilizadores…</div>;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3 hidden sm:table-cell">Email</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acções</th>
          </tr>
        </thead>
        <tbody>
          {(users ?? []).map((u) => (
            <tr key={u.id} className="border-t border-border bg-surface/50">
              <td className="px-4 py-3 font-semibold">{u.nome}</td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">
                {u.status_pagamento === "pagante" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                    <Crown className="h-3 w-3" /> Pagante
                  </span>
                ) : (
                  <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                    Não pagante
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={toggle.isPending}
                  onClick={() => toggle.mutate(u)}
                  className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  {u.status_pagamento === "pagante" ? "Revogar acesso" : "Conceder acesso"}
                </button>
              </td>
            </tr>
          ))}
          {(users ?? []).length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                Ainda não há utilizadores registados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
