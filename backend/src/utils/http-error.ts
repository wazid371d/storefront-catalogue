export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  static notFound(message = 'Not found'): HttpError {
    return new HttpError(404, message);
  }

  static badRequest(message: string, details?: unknown): HttpError {
    return new HttpError(422, message, details);
  }

  static serviceUnavailable(message: string): HttpError {
    return new HttpError(503, message);
  }
}
