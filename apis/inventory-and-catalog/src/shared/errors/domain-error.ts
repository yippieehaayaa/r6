export abstract class DomainError extends Error {
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DomainError {
  readonly httpStatus = 404;
}

export class ConflictError extends DomainError {
  readonly httpStatus = 409;
}

export class UnprocessableError extends DomainError {
  readonly httpStatus = 422;
}
