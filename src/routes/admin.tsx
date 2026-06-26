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
  Upload,
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
                  <div className="inline-flex flex-wrap justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setManagingEps(d)}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary"
                    >
                      <ListVideo className="h-3.5 w-3.5" /> Episódios
                    </button>
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

      {managingEps && (
        <EpisodesManager
          dorama={managingEps}
          onClose={() => setManagingEps(null)}
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

// --------------------------- EPISODES MANAGER ---------------------------

function EpisodesManager({ dorama, onClose }: { dorama: Dorama; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: episodes, isLoading } = useQuery({
    queryKey: ["admin", "episodes", dorama.id],
    queryFn: async (): Promise<EpisodeRow[]> => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("dorama_id", dorama.id)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EpisodeRow[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "episodes", dorama.id] });
    qc.invalidateQueries({ queryKey: ["doramas"] });
  };

  const createM = useMutation({
    mutationFn: async () => {
      const nextOrdem = (episodes?.length ?? 0) + 1;
      const { error } = await supabase.from("episodes").insert({
        dorama_id: dorama.id,
        ordem: nextOrdem,
        titulo: `Episódio ${nextOrdem}`,
        duracao: "40 min",
        video_url:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateM = useMutation({
    mutationFn: async (ep: EpisodeRow) => {
      const { error } = await supabase
        .from("episodes")
        .update({
          ordem: ep.ordem,
          titulo: ep.titulo,
          duracao: ep.duracao,
          video_url: ep.video_url,
        })
        .eq("id", ep.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("episodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const swap = async (a: EpisodeRow, b: EpisodeRow) => {
    // Two-step swap to avoid unique conflicts if present
    await supabase.from("episodes").update({ ordem: -a.ordem }).eq("id", a.id);
    await supabase.from("episodes").update({ ordem: a.ordem }).eq("id", b.id);
    await supabase.from("episodes").update({ ordem: b.ordem }).eq("id", a.id);
    invalidate();
  };

  const move = (idx: number, dir: -1 | 1) => {
    if (!episodes) return;
    const target = idx + dir;
    if (target < 0 || target >= episodes.length) return;
    void swap(episodes[idx], episodes[target]);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-border bg-surface-elevated shadow-glow">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface-elevated/95 px-6 py-4 backdrop-blur">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Episódios</div>
            <h2 className="truncate font-display text-xl font-bold">{dorama.titulo}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={createM.isPending}
              onClick={() => createM.mutate()}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" /> Novo episódio
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 px-6 py-5">
          {isLoading && <div className="text-sm text-muted-foreground">A carregar…</div>}
          {!isLoading && (episodes?.length ?? 0) === 0 && (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Sem episódios. Clique em <strong>Novo episódio</strong>.
            </div>
          )}
          {episodes?.map((ep, idx) => (
            <EpisodeRowEditor
              key={ep.id}
              ep={ep}
              isFirst={idx === 0}
              isLast={idx === (episodes.length - 1)}
              onMoveUp={() => move(idx, -1)}
              onMoveDown={() => move(idx, 1)}
              onSave={(next) => updateM.mutate(next)}
              onDelete={() => {
                if (confirm(`Eliminar "${ep.titulo}"?`)) deleteM.mutate(ep.id);
              }}
              saving={updateM.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EpisodeRowEditor({
  ep,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete,
  saving,
}: {
  ep: EpisodeRow;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: (ep: EpisodeRow) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [local, setLocal] = useState<EpisodeRow>(ep);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  useEffect(() => setLocal(ep), [ep]);
  const dirty =
    local.titulo !== ep.titulo ||
    local.duracao !== ep.duracao ||
    local.video_url !== ep.video_url;

  const handleUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    setUploadPct(0);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${ep.dorama_id}/${ep.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("episode-videos")
        .upload(path, file, {
          upsert: true,
          contentType: file.type || "video/mp4",
        });
      if (upErr) throw upErr;
      setUploadPct(80);
      // Signed URL valid for 10 years (effectively permanent for streaming)
      const { data: signed, error: sErr } = await supabase.storage
        .from("episode-videos")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr ?? new Error("Falha ao gerar URL");
      setLocal((l) => ({ ...l, video_url: signed.signedUrl }));
      setUploadPct(100);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="grid h-7 w-7 place-items-center rounded-md border border-border bg-surface-elevated text-muted-foreground disabled:opacity-30"
            aria-label="Mover para cima"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <div className="text-center text-xs font-semibold text-muted-foreground">#{ep.ordem}</div>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="grid h-7 w-7 place-items-center rounded-md border border-border bg-surface-elevated text-muted-foreground disabled:opacity-30"
            aria-label="Mover para baixo"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_120px]">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Título
            </span>
            <input
              type="text"
              value={local.titulo}
              onChange={(e) => setLocal({ ...local, titulo: e.target.value })}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Duração
            </span>
            <input
              type="text"
              value={local.duracao}
              onChange={(e) => setLocal({ ...local, duracao: e.target.value })}
              className="input"
            />
          </label>
          <div className="block sm:col-span-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vídeo do episódio
              </span>
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20">
                <Upload className="h-3 w-3" />
                {uploading ? `A enviar… ${uploadPct}%` : "Enviar vídeo"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            <input
              type="text"
              value={local.video_url}
              onChange={(e) => setLocal({ ...local, video_url: e.target.value })}
              className="input"
              placeholder="Cole um URL ou envie um ficheiro"
            />
            {local.video_url && !uploading && (
              <video
                src={local.video_url}
                controls
                preload="metadata"
                className="mt-2 max-h-40 w-full rounded-lg bg-black"
              />
            )}
            {uploadError && (
              <p className="mt-1 text-xs text-destructive">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </button>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => onSave(local)}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" /> Guardar
        </button>
      </div>
    </div>
  );
}
