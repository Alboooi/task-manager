import { createSessionCookie } from "@/lib/SessionCookie";
import { UserRepository } from "@/lib/repositories/UserRepository";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    const user = UserRepository.findByEmail(email);

    if (!user || !user.login(password)) {
      return Response.json(
        { error: "Email o password non valide." },
        { status: 401 },
      );
    }

    UserRepository.save(user);

    await createSessionCookie(user.id);

    return Response.json({
      user: user.getProfile(),
    });
  } catch {
    return Response.json(
      { error: "Email o password non valide." },
      { status: 401 },
    );
  }
}
