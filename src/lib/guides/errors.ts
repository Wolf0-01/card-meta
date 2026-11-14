export type GuideErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT";

export interface GuideIssue {
  path: string;
  message: string;
}

export class GuideError extends Error {
  readonly code: GuideErrorCode;

  readonly status: number;

  readonly issues: GuideIssue[];

  constructor(
    code: GuideErrorCode,
    message: string,
    issues: GuideIssue[] = []
  ) {
    super(message);

    this.name = "GuideError";

    this.code = code;

    this.status = {
      VALIDATION: 422,
      NOT_FOUND: 404,
      CONFLICT: 409,
    }[code];

    this.issues = issues;
  }
}
