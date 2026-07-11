import { DomainError } from "./domain.error";

export class InvalidStatusTransitionError extends DomainError {
  readonly code = "INVALID_STATUS_TRANSITION";

  constructor(entity: string, from: string, to: string) {
    super(`${entity} cannot transition from "${from}" to "${to}"`);
  }
}
