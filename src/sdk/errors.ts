export class LiveClientError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** Thrown when the Live Client Data port is closed or refuses the connection, i.e. no game is running. */
export class GameNotRunningError extends LiveClientError {}

/** Thrown when the Live Client Data API does not answer within the configured timeout. */
export class RiotApiTimeoutError extends LiveClientError {}

/** Thrown when the API answers with a non-2xx status or a body that is not valid JSON. */
export class RiotApiError extends LiveClientError {
  readonly status: number | undefined;

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.status = options?.status;
  }
}
