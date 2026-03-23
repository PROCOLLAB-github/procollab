/** @format */

export type PasswordError =
  | { kind: "server_error" }
  | { kind: "invalid_token" }
  | { kind: "unknown"; cause?: unknown };
