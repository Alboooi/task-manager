import { cookies } from "next/headers";
import { SessionRepository } from "@/lib/repositories/SessionRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import type { User } from "@/lib/User";

const SESSION_COOKIE_NAME = "task_manager_session";

export async function createSessionCookie(userId: string): Promise<void> {
  const session = SessionRepository.createForUser(userId);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return undefined;
  }

  const session = SessionRepository.findById(sessionId);

  if (!session) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return undefined;
  }

  if (session.expired) {
    SessionRepository.deleteById(session.id);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return undefined;
  }

  const user = UserRepository.findById(session.userId);

  if (!user) {
    SessionRepository.deleteById(session.id);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return undefined;
  }

  return user;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    SessionRepository.deleteById(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
