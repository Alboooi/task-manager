export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export class Task {
  private static readonly TITLE_MAX_LENGTH = 120;
  private static readonly DESCRIPTION_MAX_LENGTH = 2000;

  readonly id: string;
  private _title: string;
  private _description: string;
  private _status: TaskStatus;
  private _completionPercentage: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(
    title: string,
    id?: string,
    status: TaskStatus = "todo",
    createdAt?: Date,
    updatedAt?: Date,
    description = "",
    completionPercentage?: number,
  ) {
    const now = new Date();

    this.id = id ?? crypto.randomUUID();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    Task.assertValidTitle(trimmedTitle);
    Task.assertValidDescription(trimmedDescription);
    Task.assertValidStatus(status);

    this._title = trimmedTitle;
    this._description = trimmedDescription;
    this._status = status;

    const percentage =
      completionPercentage ?? Task.percentageFromStatus(status);

    Task.assertValidPercentageForStatus(percentage, status);

    this._completionPercentage = percentage;
    this.createdAt = createdAt ?? now;
    this._updatedAt = updatedAt ?? now;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get completionPercentage(): number {
    return this._completionPercentage;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateTitle(title: string): void {
    const trimmed = title.trim();
    Task.assertValidTitle(trimmed);
    this._title = trimmed;
    this.touch();
  }

  updateDescription(description: string): void {
    const trimmed = description.trim();
    Task.assertValidDescription(trimmed);
    this._description = trimmed;
    this.touch();
  }

  updateStatus(status: TaskStatus): void {
    Task.assertValidStatus(status);

    if (this._status !== status) {
      this._status = status;
      this._completionPercentage = Task.percentageFromStatus(status);
      this.touch();
    }
  }

  markTodo(): void {
    this.updateStatus("todo");
  }

  markInProgress(): void {
    this.updateStatus("in_progress");
  }

  markDone(): void {
    this.updateStatus("done");
  }

  set completionPercentage(value: number) {
    Task.assertValidPercentage(value);

    const nextStatus = Task.statusFromPercentage(value);

    this._completionPercentage = value;
    this._status = nextStatus;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  private static percentageFromStatus(status: TaskStatus): number {
    switch (status) {
      case "todo":
        return 0;
      case "in_progress":
        return 50;
      case "done":
        return 100;
    }
  }

  private static statusFromPercentage(value: number): TaskStatus {
    if (value === 0) {
      return "todo";
    }

    if (value === 100) {
      return "done";
    }

    return "in_progress";
  }

  private static assertValidStatus(status: string): asserts status is TaskStatus {
    if (!["todo", "in_progress", "done"].includes(status)) {
      throw new Error(
        "Lo stato della task deve essere: todo, in_progress oppure done.",
      );
    }
  }

  private static assertValidPercentage(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(
        "La percentuale di completamento deve essere un numero tra 0 e 100.",
      );
    }
  }

  private static assertValidPercentageForStatus(
    value: number,
    status: TaskStatus,
  ): void {
    Task.assertValidPercentage(value);

    if (status === "todo" && value !== 0) {
      throw new Error("Una task todo deve avere completionPercentage pari a 0.");
    }

    if (status === "done" && value !== 100) {
      throw new Error("Una task done deve avere completionPercentage pari a 100.");
    }

    if (status === "in_progress" && (value <= 0 || value >= 100)) {
      throw new Error(
        "Una task in_progress deve avere completionPercentage tra 1 e 99.",
      );
    }
  }

  private static assertValidTitle(title: string): void {
    if (!title) {
      throw new Error("Il titolo della task non può essere vuoto.");
    }

    if (title.length > Task.TITLE_MAX_LENGTH) {
      throw new Error(
        `Il titolo della task non può superare ${Task.TITLE_MAX_LENGTH} caratteri.`,
      );
    }
  }

  private static assertValidDescription(description: string): void {
    if (description.length > Task.DESCRIPTION_MAX_LENGTH) {
      throw new Error(
        `La descrizione non può superare ${Task.DESCRIPTION_MAX_LENGTH} caratteri.`,
      );
    }
  }

  toJSON(): TaskData {
    return {
      id: this.id,
      title: this._title,
      description: this._description,
      status: this._status,
      completionPercentage: this._completionPercentage,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  static fromJSON(data: TaskData): Task {
    return new Task(
      data.title,
      data.id,
      data.status,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.description ?? "",
      data.completionPercentage,
    );
  }
}
