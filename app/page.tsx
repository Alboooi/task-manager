"use client";

import { FormEvent, useMemo, useState } from "react";

type TaskStatus = "todo" | "in_progress" | "done";

type User = {
  id: string;
  displayName: string;
  email: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
};

const statuses: TaskStatus[] = ["todo", "in_progress", "done"];

const statusLabels: Record<TaskStatus, string> = {
  todo: "Da fare",
  in_progress: "In corso",
  done: "Completata",
};

const statusClasses: Record<TaskStatus, string> = {
  todo: "border-slate-200 bg-slate-100 text-slate-700",
  in_progress: "border-amber-200 bg-amber-100 text-amber-800",
  done: "border-emerald-200 bg-emerald-100 text-emerald-800",
};

const statusDotClasses: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [displayName, setDisplayName] = useState("Alberto");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Password1");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length,
    };
  }, [tasks]);

  async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error ?? "Errore durante la richiesta.");
    }

    return data;
  }

  async function loadTasks(currentFilter = filter) {
    setLoading(true);
    setError("");

    try {
      const query = currentFilter === "all" ? "" : `?status=${currentFilter}`;
      const data = await request<{ tasks: Task[] }>(`/api/tasks${query}`);
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento task.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const endpoint =
        authMode === "register" ? "/api/auth/register" : "/api/auth/login";

      const body =
        authMode === "register"
          ? { displayName, email, password }
          : { email, password };

      const data = await request<{ user: User }>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setUser(data.user);
      setMessage(
        authMode === "register"
          ? "Registrazione effettuata."
          : "Login effettuato.",
      );

      const tasksData = await request<{ tasks: Task[] }>("/api/tasks");
      setTasks(tasksData.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore autenticazione.");
    }
  }

  async function handleLogout() {
    await request("/api/auth/logout", { method: "POST" });
    setUser(null);
    setTasks([]);
    setMessage("Logout effettuato.");
  }

  async function createTask(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await request<{ task: Task }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          status: "todo",
        }),
      });

      setTitle("");
      setDescription("");
      setMessage("Task creata correttamente.");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore creazione task.");
    }
  }

  async function updateStatus(task: Task, status: TaskStatus) {
    setError("");
    setMessage("");

    try {
      await request<{ task: Task }>(`/api/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      setMessage("Stato aggiornato.");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore update task.");
    }
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description);
  }

  async function saveEditing(task: Task) {
    setError("");
    setMessage("");

    try {
      await request<{ task: Task }>(`/api/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingTitle,
          description: editingDescription,
        }),
      });

      setEditingId(null);
      setMessage("Task modificata.");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore modifica task.");
    }
  }

  async function deleteTask(task: Task) {
    setError("");
    setMessage("");

    try {
      await request(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      setMessage("Task eliminata.");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore eliminazione task.");
    }
  }

  async function changeFilter(value: TaskStatus | "all") {
    setFilter(value);
    await loadTasks(value);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <section className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200">
              Fullstack Task Manager
            </p>

            <h1 className="text-5xl font-black tracking-tight md:text-6xl">
              Organizza le attività con una web app completa.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              CRUD task, filtro per stato, autenticazione, sessioni HTTP-only,
              persistenza SQLite e API REST con Next.js.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-bold">REST</p>
                <p className="text-sm text-slate-300">API</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-bold">SQLite</p>
                <p className="text-sm text-slate-300">Database</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-bold">Next</p>
                <p className="text-sm text-slate-300">Frontend</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
                  authMode === "register"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600"
                }`}
              >
                Registrati
              </button>

              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
                  authMode === "login"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600"
                }`}
              >
                Accedi
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "register" && (
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-slate-950"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nome"
                />
              )}

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-slate-950"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
              />

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-slate-950"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
              />

              <button className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white transition hover:bg-slate-800">
                {authMode === "register" ? "Crea account" : "Entra"}
              </button>
            </form>

            {message && (
              <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-2xl bg-red-50 p-4 text-red-700">
                {error}
              </p>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">
                Bentornato, {user.displayName}
              </p>
              <h1 className="text-4xl font-black tracking-tight">
                Task Manager
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Gestisci attività, modifica dettagli, cambia stato e filtra il
                lavoro in base all’avanzamento.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-950"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{stats.total}</p>
              <p className="text-sm text-slate-300">Totali</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{stats.todo}</p>
              <p className="text-sm text-slate-300">Da fare</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{stats.inProgress}</p>
              <p className="text-sm text-slate-300">In corso</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{stats.done}</p>
              <p className="text-sm text-slate-300">Completate</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Nuova attività</h2>
            <p className="mt-2 text-sm text-slate-500">
              Crea una task con titolo e descrizione. Lo stato iniziale sarà
              “Da fare”.
            </p>

            <form onSubmit={createTask} className="mt-6 space-y-4">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-slate-950"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Titolo attività"
              />

              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-slate-950"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descrizione"
              />

              <button className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white transition hover:bg-slate-800">
                Crea task
              </button>
            </form>

            <div className="mt-8">
              <h3 className="mb-3 font-bold">Filtro stato</h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => changeFilter("all")}
                  className={`rounded-2xl border px-4 py-3 font-semibold transition ${
                    filter === "all"
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  Tutte
                </button>

                {statuses.map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => changeFilter(status)}
                    className={`rounded-2xl border px-4 py-3 font-semibold transition ${
                      filter === status
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            {message && (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                {message}
              </p>
            )}

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </p>
            )}

            {loading && (
              <p className="rounded-2xl bg-white p-6 shadow-sm">
                Caricamento attività...
              </p>
            )}

            {!loading && tasks.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <p className="text-4xl">📝</p>
                <h2 className="mt-4 text-2xl font-black">
                  Nessuna attività presente
                </h2>
                <p className="mt-2 text-slate-500">
                  Crea la prima task dal form a sinistra.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {editingId === task.id ? (
                    <div className="space-y-4">
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold outline-none focus:border-slate-950"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                      />

                      <textarea
                        className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-slate-950"
                        value={editingDescription}
                        onChange={(event) =>
                          setEditingDescription(event.target.value)
                        }
                      />

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => saveEditing(task)}
                          className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
                        >
                          Salva modifiche
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${statusClasses[task.status]}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${statusDotClasses[task.status]}`}
                              />
                              {statusLabels[task.status]}
                            </span>

                            <span className="text-sm text-slate-400">
                              {task.completionPercentage}% completata
                            </span>
                          </div>

                          <h2 className="text-2xl font-black">{task.title}</h2>
                          <p className="mt-2 leading-7 text-slate-600">
                            {task.description || "Nessuna descrizione."}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteTask(task)}
                          className="rounded-2xl border border-red-200 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Elimina
                        </button>
                      </div>

                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-950 transition-all"
                          style={{ width: `${task.completionPercentage}%` }}
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {statuses.map((status) => (
                          <button
                            type="button"
                            key={status}
                            onClick={() => updateStatus(task, status)}
                            className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                              task.status === status
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {statusLabels[status]}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => startEditing(task)}
                          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:bg-slate-50"
                        >
                          Modifica
                        </button>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
                        <p>
                          Creata: {new Date(task.createdAt).toLocaleString()}
                        </p>
                        <p>
                          Ultima modifica:{" "}
                          {new Date(task.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
