import { db } from "@/lib/DataBase";
import { Session, type SessionData } from "@/lib/Session";

type SessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

export class SessionRepository {
  private static readonly insertStmt = db.prepare(`
    INSERT INTO sessions (
      id,
      user_id,
      created_at,
      expires_at
    )
    VALUES (
      @id,
      @user_id,
      @created_at,
      @expires_at
    )
  `);

  private static readonly selectByIdStmt = db.prepare(`
    SELECT id, user_id, created_at, expires_at
    FROM sessions
    WHERE id = ?
  `);

  private static readonly deleteByIdStmt = db.prepare(`
    DELETE FROM sessions
    WHERE id = ?
  `);

  private static readonly deleteExpiredStmt = db.prepare(`
    DELETE FROM sessions
    WHERE expires_at <= ?
  `);

  static createForUser(userId: string): Session {
    const session = Session.create(userId);
    const data = session.toJSON();

    SessionRepository.insertStmt.run(
      SessionRepository.sessionDataToRow(data),
    );

    return session;
  }

  static findById(id: string): Session | undefined {
    const row = SessionRepository.selectByIdStmt.get(id) as
      | SessionRow
      | undefined;

    if (!row) {
      return undefined;
    }

    return Session.fromJSON(SessionRepository.rowToSessionData(row));
  }

  static deleteById(id: string): boolean {
    const result = SessionRepository.deleteByIdStmt.run(id);
    return result.changes > 0;
  }

  static deleteExpired(): number {
    const result = SessionRepository.deleteExpiredStmt.run(
      new Date().toISOString(),
    );

    return result.changes;
  }

  private static rowToSessionData(row: SessionRow): SessionData {
    return {
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  }

  private static sessionDataToRow(data: SessionData) {
    return {
      id: data.id,
      user_id: data.userId,
      created_at: data.createdAt,
      expires_at: data.expiresAt,
    };
  }
}