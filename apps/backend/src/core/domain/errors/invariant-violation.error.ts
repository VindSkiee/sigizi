import { DomainError } from "./domain.error";

export class InvariantViolationError extends DomainError {
  readonly code = "INVARIANT_VIOLATION";

  constructor(message: string) {
    super(message);
  }
}
