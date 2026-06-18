import { db } from "../DataBase";
import { User, type UserData } from "../User";
import { TaskRepository } from "./TaskRepository";

type UserRow = {
  id: string;
  display_name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
  last_login_at: string | null;
};

export class UserRepository {
  private static readonly insertStmt = db.prepare(`
    INSERT INTO users (
      id,
      display_name,
      email,
      password_hash,
      password_salt,
      created_at,
      last_login_at
    )
    VALUES (
      @id,
      @display_name,
      @email,
      @password_hash,
      @password_salt,
      @created_at,
      @last_login_at
    )
  `);

  private static readonly selectByIdStmt = db.prepare(`
    SELECT id, display_name, email, password_hash, password_salt, created_at, last_login_at
    FROM users
    WHERE id = ?
  `);

  private static readonly selectAllByEmailStmt = db.prepare(`
    SELECT id, display_name, email, password_hash, password_salt, created_at, last_login_at
    FROM users
    WHERE email = ?
    ORDER BY created_at DESC
  `);

  private static readonly updateStmt = db.prepare(`
    UPDATE users
    SET
      display_name = @display_name,
      email = @email,
      password_hash = @password_hash,
      password_salt = @password_salt,
      last_login_at = @last_login_at
    WHERE id = @id
  `);

  private static readonly deleteStmt = db.prepare(`
    DELETE FROM users
    WHERE id = ?
  `);

  static create(user: User): User {
    const data = user.toJSON();
    UserRepository.insertStmt.run(UserRepository.userDataToRow(data));
    return user;
  }

  static findById(id: string): User | undefined {
    const row = UserRepository.selectByIdStmt.get(id) as UserRow | undefined;

    if (!row) {
      return undefined;
    }

    return UserRepository.rowToUser(row);
  }

  static findAllByEmail(email: string): User[] {
    const normalizedEmail = email.trim().toLowerCase();

    const rows = UserRepository.selectAllByEmailStmt.all(
      normalizedEmail,
    ) as UserRow[];

    return rows.map((row) => UserRepository.rowToUser(row));
  }

  static findByEmail(email: string): User | undefined {
    return UserRepository.findAllByEmail(email)[0];
  }

  static save(user: User): void {
    const data = user.toJSON();

    const result = UserRepository.updateStmt.run(
      UserRepository.userDataToRow(data),
    );

    if (result.changes === 0) {
      throw new Error(`Utente con id "${user.id}" non trovato.`);
    }
  }

  static delete(id: string): boolean {
    const result = UserRepository.deleteStmt.run(id);
    return result.changes > 0;
  }

  private static rowToUser(row: UserRow): User {
    const tasks = TaskRepository.findByUserId(row.id).map((task) =>
      task.toJSON(),
    );

    const data: UserData = {
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      passwordHash: row.password_hash,
      passwordSalt: row.password_salt,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      tasks: {
        tasks,
      },
    };

    return User.fromJSON(data);
  }

  private static userDataToRow(data: UserData) {
    return {
      id: data.id,
      display_name: data.displayName,
      email: data.email,
      password_hash: data.passwordHash,
      password_salt: data.passwordSalt,
      created_at: data.createdAt,
      last_login_at: data.lastLoginAt,
    };
  }
}
