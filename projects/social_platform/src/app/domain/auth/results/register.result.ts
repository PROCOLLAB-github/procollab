/** @format */

export type RegisterFieldErrors = Record<string, string[]>;

export type RegisterError =
  | { kind: "server_error" }
  | { kind: "validation_error"; errors: RegisterFieldErrors }
  | { kind: "unknown"; cause?: unknown };
