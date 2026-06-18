import { getCurrentUser } from "@/lib/SessionCookie";
import { TaskRepository } from "@/lib/repositories/TaskRepository";
import type { TaskData, TaskStatus } from "@/lib/Task";

const VALID_STATUSES: readonly TaskStatus[] = ["todo", "in_progress", "done"];

function isValidStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(value as TaskStatus)
  );
}

function defaultPercentageFromStatus(status: TaskStatus): number {
  if (status === "todo") {
    return 0;
  }

  if (status === "done") {
    return 100;
  }

  return 50;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  let status: TaskStatus | undefined;

  if (statusParam) {
    if (!isValidStatus(statusParam)) {
      return Response.json(
        { error: "Status non valido. Usa: todo, in_progress oppure done." },
        { status: 400 },
      );
    }

    status = statusParam;
  }

  const tasks = status
    ? TaskRepository.findByUserIdAndStatus(user.id, status)
    : TaskRepository.findByUserId(user.id);

  return Response.json({
    tasks: tasks.map((task) => task.toJSON()),
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Non autenticato." }, { status: 401 });
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        { error: "Body della richiesta non valido." },
        { status: 400 },
      );
    }

    const payload = body as {
      title?: unknown;
      description?: unknown;
      status?: unknown;
      completionPercentage?: unknown;
    };

    const title = typeof payload.title === "string" ? payload.title : "";
    const description =
      typeof payload.description === "string" ? payload.description : "";

    let status: TaskStatus = "todo";

    if (payload.status !== undefined) {
      if (!isValidStatus(payload.status)) {
        return Response.json(
          { error: "Status non valido. Usa: todo, in_progress oppure done." },
          { status: 400 },
        );
      }

      status = payload.status;
    }

    const completionPercentage =
      typeof payload.completionPercentage === "number"
        ? payload.completionPercentage
        : defaultPercentageFromStatus(status);

    const now = new Date().toISOString();

    const data: TaskData = {
      id: crypto.randomUUID(),
      title,
      description,
      status,
      completionPercentage,
      createdAt: now,
      updatedAt: now,
    };

    const task = TaskRepository.createForUser(user.id, data);

    return Response.json({ task: task.toJSON() }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Errore interno." },
      { status: 400 },
    );
  }
}
