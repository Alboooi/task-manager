import { createSessionCookie } from "@/lib/SessionCookie";
import { User } from "@/lib/User";
import { UserRepository } from "@/lib/repositories/UserRepository";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const displayName =
      typeof body.displayName === "string" ? body.displayName : "";

    const email = typeof body.email === "string" ? body.email : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const existingUser = UserRepository.findByEmail(email);

    if (existingUser) {
      return Response.json(
        { error: "Email già registrata." },
        { status: 409 },
      );
    }

    const user = User.create(displayName, email, password);

    UserRepository.create(user);

    await createSessionCookie(user.id);

    return Response.json(
      { user: user.getProfile() },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Errore interno.",
      },
      { status: 400 },
    );
  }
}
