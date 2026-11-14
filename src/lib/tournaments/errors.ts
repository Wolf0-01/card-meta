export type TournamentErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT";

export interface TournamentIssue {
  path: string;
  message: string;
}

export class TournamentError extends Error {
  readonly code: TournamentErrorCode;

  readonly status: number;

  readonly issues: TournamentIssue[];

  constructor(
    code: TournamentErrorCode,
    message: string,
    issues: TournamentIssue[] = []
  ) {
    super(message);

    this.name = "TournamentError";

    this.code = code;

    this.status = {
      VALIDATION: 422,
      NOT_FOUND: 404,
      CONFLICT: 409,
    }[code];

    this.issues = issues;
  }
}
