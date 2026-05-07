/** @format */

import { LoginResponse } from "../http.model";

export interface LoginResult {
  tokens: LoginResponse;
}

export type LoginError = { kind: "wrong_credentials" } | { kind: "unknown" };
