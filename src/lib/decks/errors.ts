export type DeckErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT";

export interface DeckIssue {
  path: string;
  message: string;
}

export class DeckError extends Error {
  readonly code: DeckErrorCode;

  readonly status: number;

  readonly issues: DeckIssue[];

  constructor(
    code: DeckErrorCode,
    message: string,
    issues: DeckIssue[] = []
  ) {
    super(message);

    this.name = "DeckError";

    this.code = code;

    this.status = {
      VALIDATION: 422,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      CONFLICT: 409,
    }[code];

    this.issues = issues;
  }
}
