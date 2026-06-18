import { getCurrentUser } from "@/lib/SessionCookie";
import { TaskRepository } from "@/lib/repositories/TaskRepository";
import type { TaskStatus } from "@/lib/Task";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

function isValidStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && VALID_STATUSES.includes(value as TaskStatus);
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  const { id } = await context.params;
  const task = TaskRepository.findByIdForUser(user.id, id);

  if (!task) {
    return Response.json({ error: "Task non trovata." }, { status: 404 });
  }

  return Response.json({
    task: task.toJSON(),
  });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Non autenticato." }, { status: 401 });
    }

    const { id } = await context.params;
    const task = TaskRepository.findByIdForUser(user.id, id);

    if (!task) {
      return Response.json({ error: "Task non trovata." }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.title === "string") {
      task.updateTitle(body.title);
    }

    if (typeof body.description === "string") {
      task.updateDescription(body.description);
    }

    if (body.status !== undefined) {
      if (!isValidStatus(body.status)) {
        return Response.json(
          { error: "Status non valido. Usa: todo, in_progress oppure done." },
          { status: 400 },
        );
      }

      task.updateStatus(body.status);
    }

    if (typeof body.completionPercentage === "number") {
      task.completionPercentage = body.completionPercentage;
    }

    TaskRepository.saveForUser(user.id, task);

    return Response.json({
      task: task.toJSON(),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Errore interno." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  return PUT(request, context);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = TaskRepository.deleteForUser(user.id, id);

  if (!deleted) {
    return Response.json({ error: "Task non trovata." }, { status: 404 });
  }

  return Response.json({
    success: true,
  });
}
