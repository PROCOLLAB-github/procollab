/** @format */

export type PasswordError =
  | { kind: "bad_request"; status: 400 }
  | { kind: "server_error"; status: 500 }
  | { kind: "network"; status: 0; cause: "unknown" }
  | { kind: "unknown"; cause?: unknown };
