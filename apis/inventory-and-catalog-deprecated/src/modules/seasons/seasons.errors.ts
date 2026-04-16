import { ConflictError, NotFoundError } from "../../shared/errors";

export class SeasonNotFoundError extends NotFoundError {
  constructor(message = "Season not found") {
    super(message);
  }
}

export class SeasonNameExistsError extends ConflictError {
  constructor(message = "Season name already exists") {
    super(message);
  }
}

export class SeasonSlugExistsError extends ConflictError {
  constructor(message = "Season slug already exists") {
    super(message);
  }
}
