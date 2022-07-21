/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "../models/http.model";
import { plainToClass } from "class-transformer";
import { Tokens } from "../models/tokens";

@Injectable()
export class AuthService {
  constructor(private apiService: ApiService) {}

  login({ email, password }: LoginRequest): Observable<LoginResponse> {
    return this.apiService
      .post("/auth/login", { email, password })
      .pipe(map(json => plainToClass(LoginResponse, json)));
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService
      .post("/auth/register", data)
      .pipe(map(json => plainToClass(RegisterResponse, json)));
  }

  refreshTokens(): Observable<RefreshResponse> {
    return this.apiService
      .post("/auth/refresh-tokens", { refresh_token: localStorage.getItem("refreshToken") })
      .pipe(map(json => plainToClass(RefreshResponse, json)));
  }

  getTokens(): Tokens | null {
    const accessToken =
      localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
    const refreshToken =
      localStorage.getItem("refreshToken") ?? sessionStorage.getItem("refreshToken");

    if (!accessToken && !refreshToken) {
      return null;
    }

    return { accessToken: accessToken as string, refreshToken: accessToken as string };
  }

  memTokens(tokens: Tokens, session = false): void {
    if (!session) {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
    } else {
      sessionStorage.setItem("accessToken", tokens.accessToken);
      sessionStorage.setItem("refreshToken", tokens.refreshToken);
    }
  }
}
