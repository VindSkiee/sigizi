import { DomainError } from "./domain.error";

export class EntityNotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier "${identifier}" not found`);
  }
}
