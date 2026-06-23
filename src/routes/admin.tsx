import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { doramas as seed, type Dorama } from "@/data/doramas";
import { Crown, Plus, Trash2, Users, Film, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · DoramaMoz" }] }),
  component: AdminPage,
});

type FakeUser = {
  id: string;
  nome: string;
  email: string;
  status: "nao_pagante" | "pagante";
};

const seedUsers: FakeUser[] = [
  { id: "u1", nome: "Ana Macuácua", email: "ana@example.mz", status: "pagante" },
  { id: "u2", nome: "Bruno Cossa", email: "bruno@example.mz", status: "nao_pagante" },
  { id: "u3", nome: "Carla Mucavele", email: "carla@example.mz", status: "pagante" },
  { id: "u4", nome: "Diogo Tembe", email: "diogo@example.mz", status: "nao_pagante" },
];

function AdminPage() {
  const user = useAuth((s) => s.user);
  const promote = useAuth((s) => s.promoteToAdmin);
  const navigate = useNavigate();
  const [tab, setTab] = useState<"doramas" | "users">("doramas");
  const [items, setItems] = useState<Dorama[]>(seed);
  const [users, setUsers] = useState<FakeUser[]>(seedUsers);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
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
          onClick={promote}
          className="mt-6 rounded-full border border-border bg-surface px-5 py-2.5 text-sm"
        >
          (DEMO) Promover-me a admin
        </button>
      </div>
    );
  }

  const addDorama = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setItems((arr) => [
      {
        ...seed[0],
        id: `new-${Date.now()}`,
        slug,
        titulo: newTitle,
        descricao: "Adicionado pelo painel admin.",
        sinopse: "Adicionado pelo painel admin.",
        rating: 8.0,
        ano: 2025,
        episodios_count: 0,
        episodios: [],
        destaque: false,
      } satisfies Dorama,
      ...arr,
    ]);
    setNewTitle("");
  };

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

      {tab === "doramas" && (
        <div className="mt-6">
          <form onSubmit={addDorama} className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-3">
            <input
              type="text"
              placeholder="Título do novo dorama"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </form>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Dorama</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="px-4 py-3 hidden md:table-cell">Episódios</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3 text-right">Acções</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-t border-border bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={d.capa} alt="" className="h-12 w-9 rounded object-cover" />
                        <span className="font-semibold">{d.titulo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{d.categoria}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{d.episodios_count}</td>
                    <td className="px-4 py-3">{d.rating.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setItems((arr) => arr.filter((x) => x.id !== d.id))}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "users" && (
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
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border bg-surface/50">
                  <td className="px-4 py-3 font-semibold">{u.nome}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.status === "pagante" ? (
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
                      onClick={() =>
                        setUsers((arr) =>
                          arr.map((x) =>
                            x.id === u.id
                              ? { ...x, status: x.status === "pagante" ? "nao_pagante" : "pagante" }
                              : x,
                          ),
                        )
                      }
                      className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold"
                    >
                      Alternar estado
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
