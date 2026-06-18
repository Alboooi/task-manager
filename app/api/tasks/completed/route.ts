import { getCurrentUser } from "@/lib/SessionCookie";
import { TaskRepository } from "@/lib/repositories/TaskRepository";

export async function DELETE() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  const deletedCount = TaskRepository.deleteDoneForUser(user.id);

  return Response.json({
    success: true,
    deletedCount,
  });
}
