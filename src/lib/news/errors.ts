export type NewsErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT";

export interface NewsIssue {
  path: string;
  message: string;
}

export class NewsError extends Error {
  readonly code: NewsErrorCode;

  readonly status: number;

  readonly issues: NewsIssue[];

  constructor(
    code: NewsErrorCode,
    message: string,
    issues: NewsIssue[] = []
  ) {
    super(message);

    this.name = "NewsError";

    this.code = code;

    this.status = {
      VALIDATION: 422,
      NOT_FOUND: 404,
      CONFLICT: 409,
    }[code];

    this.issues = issues;
  }
}
