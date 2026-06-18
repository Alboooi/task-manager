import { TasksSet } from "./TasksSet";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface UserData {
  id: string;
  displayName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  lastLoginAt: string | null;
  tasks?: ReturnType<TasksSet["toJSON"]>;
}

export class User {
  private static readonly DISPLAY_NAME_MIN_LENGTH = 2;
  private static readonly DISPLAY_NAME_MAX_LENGTH = 50;
  private static readonly EMAIL_MAX_LENGTH = 254;
  private static readonly PASSWORD_MIN_LENGTH = 8;
  private static readonly PASSWORD_MAX_LENGTH = 128;

  readonly id: string;
  private _displayName: string;
  private _email: string;
  private _passwordHash: string;
  private _passwordSalt: string;
  readonly createdAt: Date;
  private _lastLoginAt: Date | null;
  private readonly tasksSet: TasksSet;

  private constructor(
    displayName: string,
    email: string,
    passwordHash: string,
    passwordSalt: string,
    id: string,
    createdAt: Date,
    lastLoginAt: Date | null,
    tasksSet: TasksSet,
  ) {
    this.id = id;
    this._displayName = displayName;
    this._email = email;
    this._passwordHash = passwordHash;
    this._passwordSalt = passwordSalt;
    this.createdAt = createdAt;
    this._lastLoginAt = lastLoginAt;
    this.tasksSet = tasksSet;
  }

  static create(displayName: string, email: string, password: string): User {
    const normalizedDisplayName = User.normalizeDisplayName(displayName);
    const normalizedEmail = User.normalizeEmail(email);

    User.assertValidDisplayName(normalizedDisplayName);
    User.assertValidEmail(normalizedEmail);
    User.assertValidPassword(password);

    const { hash, salt } = User.hashPassword(password);

    return new User(
      normalizedDisplayName,
      normalizedEmail,
      hash,
      salt,
      crypto.randomUUID(),
      new Date(),
      null,
      new TasksSet(),
    );
  }

  static fromJSON(data: UserData): User {
    const normalizedDisplayName = User.normalizeDisplayName(data.displayName);
    const normalizedEmail = User.normalizeEmail(data.email);

    User.assertValidDisplayName(normalizedDisplayName);
    User.assertValidEmail(normalizedEmail);

    if (!data.passwordHash || !data.passwordSalt) {
      throw new Error("Dati di autenticazione utente non validi.");
    }

    return new User(
      normalizedDisplayName,
      normalizedEmail,
      data.passwordHash,
      data.passwordSalt,
      data.id,
      new Date(data.createdAt),
      data.lastLoginAt ? new Date(data.lastLoginAt) : null,
      TasksSet.fromJSON(data.tasks ?? { tasks: [] }),
    );
  }

  get displayName(): string {
    return this._displayName;
  }

  get email(): string {
    return this._email;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  getProfile(): UserProfile {
    return {
      id: this.id,
      displayName: this._displayName,
      email: this._email,
      createdAt: this.createdAt,
      lastLoginAt: this._lastLoginAt,
    };
  }

  updateProfile(updates: { displayName?: string; email?: string }): void {
    const displayName =
      updates.displayName !== undefined
        ? User.normalizeDisplayName(updates.displayName)
        : this._displayName;

    const email =
      updates.email !== undefined
        ? User.normalizeEmail(updates.email)
        : this._email;

    User.assertValidDisplayName(displayName);
    User.assertValidEmail(email);

    this._displayName = displayName;
    this._email = email;
  }

  login(password: string): boolean {
    if (!password) {
      return false;
    }

    if (!this.verifyPassword(password)) {
      return false;
    }

    this._lastLoginAt = new Date();
    return true;
  }

  changePassword(currentPassword: string, newPassword: string): void {
    if (!currentPassword) {
      throw new Error("La password attuale è obbligatoria.");
    }

    if (!this.verifyPassword(currentPassword)) {
      throw new Error("La password attuale non è corretta.");
    }

    User.assertValidPassword(newPassword);

    const { hash, salt } = User.hashPassword(newPassword);
    this._passwordHash = hash;
    this._passwordSalt = salt;
  }

  getTasksSet(): TasksSet {
    return this.tasksSet;
  }

  toJSON(): UserData {
    return {
      id: this.id,
      displayName: this._displayName,
      email: this._email,
      passwordHash: this._passwordHash,
      passwordSalt: this._passwordSalt,
      createdAt: this.createdAt.toISOString(),
      lastLoginAt: this._lastLoginAt?.toISOString() ?? null,
      tasks: this.tasksSet.toJSON(),
    };
  }

  private verifyPassword(password: string): boolean {
    const salt = Buffer.from(this._passwordSalt, "hex");
    const storedHash = Buffer.from(this._passwordHash, "hex");
    const candidateHash = scryptSync(password, salt, 64);

    if (storedHash.length !== candidateHash.length) {
      return false;
    }

    return timingSafeEqual(storedHash, candidateHash);
  }

  private static hashPassword(password: string): { hash: string; salt: string } {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);

    return {
      hash: hash.toString("hex"),
      salt: salt.toString("hex"),
    };
  }

  private static normalizeDisplayName(displayName: string): string {
    return displayName.trim();
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private static assertValidDisplayName(displayName: string): void {
    if (!displayName) {
      throw new Error("Il nome utente non può essere vuoto.");
    }

    if (displayName.length < User.DISPLAY_NAME_MIN_LENGTH) {
      throw new Error(
        `Il nome utente deve contenere almeno ${User.DISPLAY_NAME_MIN_LENGTH} caratteri.`,
      );
    }

    if (displayName.length > User.DISPLAY_NAME_MAX_LENGTH) {
      throw new Error(
        `Il nome utente non può superare ${User.DISPLAY_NAME_MAX_LENGTH} caratteri.`,
      );
    }
  }

  private static assertValidEmail(email: string): void {
    if (!email) {
      throw new Error("L'email non può essere vuota.");
    }

    if (email.length > User.EMAIL_MAX_LENGTH) {
      throw new Error(
        `L'email non può superare ${User.EMAIL_MAX_LENGTH} caratteri.`,
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("L'email non è valida.");
    }
  }

  private static assertValidPassword(password: string): void {
    if (!password) {
      throw new Error("La password non può essere vuota.");
    }

    if (password.length < User.PASSWORD_MIN_LENGTH) {
      throw new Error(
        `La password deve contenere almeno ${User.PASSWORD_MIN_LENGTH} caratteri.`,
      );
    }

    if (password.length > User.PASSWORD_MAX_LENGTH) {
      throw new Error(
        `La password non può superare ${User.PASSWORD_MAX_LENGTH} caratteri.`,
      );
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error(
        "La password deve contenere almeno una lettera e un numero.",
      );
    }
  }
}
