import { db } from "../DataBase";
import { Task, type TaskData, type TaskStatus } from "../Task";

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
};

export class TaskRepository {
  private static readonly selectByUserIdStmt = db.prepare(`
    SELECT id, user_id, title, description, status, completion_percentage, created_at, updated_at
    FROM tasks
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  private static readonly selectByUserIdAndStatusStmt = db.prepare(`
    SELECT id, user_id, title, description, status, completion_percentage, created_at, updated_at
    FROM tasks
    WHERE user_id = ? AND status = ?
    ORDER BY created_at DESC
  `);

  private static readonly selectByIdForUserStmt = db.prepare(`
    SELECT id, user_id, title, description, status, completion_percentage, created_at, updated_at
    FROM tasks
    WHERE id = ? AND user_id = ?
  `);

  private static readonly insertStmt = db.prepare(`
    INSERT INTO tasks (
      id,
      user_id,
      title,
      description,
      status,
      completion_percentage,
      created_at,
      updated_at
    )
    VALUES (
      @id,
      @user_id,
      @title,
      @description,
      @status,
      @completion_percentage,
      @created_at,
      @updated_at
    )
  `);

  private static readonly updateStmt = db.prepare(`
    UPDATE tasks
    SET
      title = @title,
      description = @description,
      status = @status,
      completion_percentage = @completion_percentage,
      updated_at = @updated_at
    WHERE id = @id AND user_id = @user_id
  `);

  private static readonly deleteStmt = db.prepare(`
    DELETE FROM tasks
    WHERE id = ? AND user_id = ?
  `);

  private static readonly deleteDoneStmt = db.prepare(`
    DELETE FROM tasks
    WHERE user_id = ? AND status = 'done'
  `);

  static findByUserId(userId: string): Task[] {
    const rows = TaskRepository.selectByUserIdStmt.all(userId) as TaskRow[];

    return rows.map((row) =>
      Task.fromJSON(TaskRepository.rowToTaskData(row)),
    );
  }

  static findByUserIdAndStatus(userId: string, status: TaskStatus): Task[] {
    const rows = TaskRepository.selectByUserIdAndStatusStmt.all(
      userId,
      status,
    ) as TaskRow[];

    return rows.map((row) =>
      Task.fromJSON(TaskRepository.rowToTaskData(row)),
    );
  }

  static findByIdForUser(
    userId: string,
    taskId: string,
  ): Task | undefined {
    const row = TaskRepository.selectByIdForUserStmt.get(
      taskId,
      userId,
    ) as TaskRow | undefined;

    if (!row) {
      return undefined;
    }

    return Task.fromJSON(TaskRepository.rowToTaskData(row));
  }

  static createForUser(userId: string, data: TaskData): Task {
    const task = Task.fromJSON(data);

    TaskRepository.insertStmt.run({
      ...TaskRepository.taskDataToRow(task.toJSON()),
      user_id: userId,
    });

    return task;
  }

  static saveForUser(userId: string, task: Task): void {
    const result = TaskRepository.updateStmt.run({
      ...TaskRepository.taskDataToRow(task.toJSON()),
      user_id: userId,
    });

    if (result.changes === 0) {
      throw new Error(
        `Task con id "${task.id}" non trovata per l'utente "${userId}".`,
      );
    }
  }

  static deleteForUser(userId: string, taskId: string): boolean {
    const result = TaskRepository.deleteStmt.run(taskId, userId);
    return result.changes > 0;
  }

  static deleteDoneForUser(userId: string): number {
    const result = TaskRepository.deleteDoneStmt.run(userId);
    return result.changes;
  }

  private static rowToTaskData(row: TaskRow): TaskData {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      completionPercentage: row.completion_percentage,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private static taskDataToRow(data: TaskData) {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      completion_percentage: data.completionPercentage,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    };
  }
}
