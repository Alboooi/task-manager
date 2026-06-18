import { Task, type TaskData, type TaskStatus } from "./Task";

export interface TasksSetData {
  tasks: TaskData[];
}

export type TaskSortField =
  | "title"
  | "description"
  | "status"
  | "completionPercentage"
  | "createdAt"
  | "updatedAt";

export type SortDirection = "asc" | "desc";

export interface TaskSortOptions {
  by: TaskSortField;
  direction?: SortDirection;
}

export class TasksSet {
  private readonly tasks: Map<string, Task>;

  constructor(tasks: Task[] = []) {
    this.tasks = new Map(tasks.map((task) => [task.id, task]));
  }

  get size(): number {
    return this.tasks.size;
  }

  getAll(options?: TaskSortOptions): Task[] {
    const tasks = [...this.tasks.values()];

    if (!options) {
      return this.sortTasks(tasks, "createdAt", "desc");
    }

    return this.sortTasks(tasks, options.by, options.direction ?? "asc");
  }

  getByStatus(status: TaskStatus, options?: TaskSortOptions): Task[] {
    return this.getAll(options).filter((task) => task.status === status);
  }

  getTodo(options?: TaskSortOptions): Task[] {
    return this.getByStatus("todo", options);
  }

  getInProgress(options?: TaskSortOptions): Task[] {
    return this.getByStatus("in_progress", options);
  }

  getDone(options?: TaskSortOptions): Task[] {
    return this.getByStatus("done", options);
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getTask(id: string): Task {
    return this.requireTask(id);
  }

  saveTask(task: Task): void {
    if (!this.tasks.has(task.id)) {
      throw new Error(
        `Task con id "${task.id}" non appartiene a questa collezione.`,
      );
    }

    this.tasks.set(task.id, task);
  }

  add(data: TaskData): Task {
    if (this.tasks.has(data.id)) {
      throw new Error(`Task con id "${data.id}" già presente nella collezione.`);
    }

    const task = Task.fromJSON(data);
    this.tasks.set(task.id, task);
    return task;
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  clearDone(): number {
    const doneIds = this.getDone().map((task) => task.id);
    doneIds.forEach((id) => this.tasks.delete(id));
    return doneIds.length;
  }

  private sortTasks(
    tasks: Task[],
    by: TaskSortField,
    direction: SortDirection,
  ): Task[] {
    const multiplier = direction === "asc" ? 1 : -1;

    return tasks.sort(
      (a, b) => multiplier * this.compareTasksByField(a, b, by),
    );
  }

  private compareTasksByField(a: Task, b: Task, by: TaskSortField): number {
    switch (by) {
      case "title":
        return a.title.localeCompare(b.title);
      case "description":
        return a.description.localeCompare(b.description);
      case "status":
        return a.status.localeCompare(b.status);
      case "completionPercentage":
        return a.completionPercentage - b.completionPercentage;
      case "createdAt":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "updatedAt":
        return a.updatedAt.getTime() - b.updatedAt.getTime();
    }
  }

  private requireTask(id: string): Task {
    const task = this.tasks.get(id);

    if (!task) {
      throw new Error(`Task con id "${id}" non trovata.`);
    }

    return task;
  }

  toJSON(): TasksSetData {
    return {
      tasks: this.getAll().map((task) => task.toJSON()),
    };
  }

  static fromJSON(data: TasksSetData): TasksSet {
    return new TasksSet(data.tasks.map((taskData) => Task.fromJSON(taskData)));
  }
}
