/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import {
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "../models/http.model";
import { plainToClass } from "class-transformer";

@Injectable()
export class AuthService {
  constructor(private apiService: ApiService) {}

  login(email: string, password: string): Observable<LoginResponse> {
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

  memTokens(tokens: LoginResponse): void {
    localStorage.setItem("accessToken", tokens.access_token);
    localStorage.setItem("refreshToken", tokens.refresh_token);
  }
}
