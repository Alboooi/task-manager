import { getCurrentUser } from "@/lib/SessionCookie";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        user: null,
      },
      { status: 401 },
    );
  }

  return Response.json({
    user: user.getProfile(),
  });
}