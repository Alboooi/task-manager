export interface SessionData {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export class Session {
  private static readonly DEFAULT_DURATION_DAYS = 7;

  readonly id: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;

  private constructor(
    userId: string,
    id: string,
    createdAt: Date,
    expiresAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
  }

  static create(userId: string): Session {
    const normalizedUserId = userId.trim();

    if (!normalizedUserId) {
      throw new Error("L'id utente è obbligatorio.");
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt);

    expiresAt.setDate(
      expiresAt.getDate() + Session.DEFAULT_DURATION_DAYS,
    );

    return new Session(
      normalizedUserId,
      crypto.randomUUID(),
      createdAt,
      expiresAt,
    );
  }

  static fromJSON(data: SessionData): Session {
    const id = data.id.trim();
    const userId = data.userId.trim();
    const createdAt = new Date(data.createdAt);
    const expiresAt = new Date(data.expiresAt);

    if (!id) {
      throw new Error("L'id della sessione è obbligatorio.");
    }

    if (!userId) {
      throw new Error("L'id utente della sessione è obbligatorio.");
    }

    if (Number.isNaN(createdAt.getTime())) {
      throw new Error("La data di creazione della sessione non è valida.");
    }

    if (Number.isNaN(expiresAt.getTime())) {
      throw new Error("La data di scadenza della sessione non è valida.");
    }

    if (expiresAt <= createdAt) {
      throw new Error(
        "La data di scadenza della sessione deve essere successiva alla data di creazione.",
      );
    }

    return new Session(userId, id, createdAt, expiresAt);
  }

  get expired(): boolean {
    return this.expiresAt <= new Date();
  }

  toJSON(): SessionData {
    return {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
    };
  }
}
