/** @format */

import { LoginResponse } from "../../../../../../core/src/lib/models/auth/http.model";

export interface LoginResult {
  tokens: LoginResponse;
}

export type LoginError = { kind: "wrong_credentials" } | { kind: "unknown" };
