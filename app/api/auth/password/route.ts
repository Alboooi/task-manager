import { getCurrentUser } from "@/lib/SessionCookie";
import { UserRepository } from "@/lib/repositories/UserRepository";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          error: "Non autenticato.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    if (!currentPassword) {
      return Response.json(
        {
          error: "La password attuale è obbligatoria.",
        },
        { status: 400 },
      );
    }

    if (!newPassword) {
      return Response.json(
        {
          error: "La nuova password è obbligatoria.",
        },
        { status: 400 },
      );
    }

    user.changePassword(
      currentPassword,
      newPassword,
    );

    UserRepository.save(user);

    return Response.json({
      success: true,
      message: "Password aggiornata correttamente.",
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Errore interno.",
      },
      { status: 400 },
    );
  }
}
