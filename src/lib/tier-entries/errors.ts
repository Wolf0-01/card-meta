export type TierEntryErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT";

export interface TierEntryIssue {
  path: string;

  message: string;
}

export class TierEntryError extends Error {
  readonly code: TierEntryErrorCode;

  readonly status: number;

  readonly issues: TierEntryIssue[];

  constructor(
    code: TierEntryErrorCode,
    message: string,
    issues: TierEntryIssue[] = []
  ) {
    super(message);

    this.name = "TierEntryError";

    this.code = code;

    this.status = {
      VALIDATION: 422,
      NOT_FOUND: 404,
      CONFLICT: 409,
    }[code];

    this.issues = issues;
  }
}
