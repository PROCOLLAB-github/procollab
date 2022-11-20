/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { concatMap, map, Observable, ReplaySubject, take, tap } from "rxjs";
import { LoginRequest, LoginResponse, RefreshResponse, RegisterRequest, RegisterResponse } from "../models/http.model";
import { plainToInstance } from "class-transformer";
import { Tokens } from "../models/tokens.model";
import { User, UserRole } from "../models/user.model";

@Injectable()
export class AuthService {
  constructor(private apiService: ApiService) {}

  login({ email, password }: LoginRequest): Observable<LoginResponse> {
    return this.apiService
      .post("/api/token/", { email, password })
      .pipe(map(json => plainToInstance(LoginResponse, json)));
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService
      .post("/auth/users/", data)
      .pipe(map(json => plainToInstance(RegisterResponse, json)));
  }

  refreshTokens(): Observable<RefreshResponse> {
    return this.apiService
      .post("/api/token/refresh/", { refresh: localStorage.getItem("refreshToken") })
      .pipe(map(json => plainToInstance(RefreshResponse, json)));
  }

  getTokens(): Tokens | null {
    const access = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken") ?? sessionStorage.getItem("refreshToken");

    if (!access || !refresh) {
      return null;
    }

    return { access, refresh };
  }

  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  }

  memTokens(tokens: Tokens, session = false): void {
    if (!session) {
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
    } else {
      sessionStorage.setItem("accessToken", tokens.access);
      sessionStorage.setItem("refreshToken", tokens.refresh);
    }
  }

  private profile$ = new ReplaySubject<User>(1);
  profile = this.profile$.asObservable();

  private roles$ = new ReplaySubject<UserRole[]>(1);
  roles = this.roles$.asObservable();

  getProfile(): Observable<User> {
    return this.apiService.get<User>("/auth/users/current/").pipe(
      map(user => plainToInstance(User, user)),
      tap(profile => this.profile$.next(profile))
    );
  }

  getUserRoles(): Observable<UserRole[]> {
    return this.apiService.get<[[number, string]]>("/auth/users/types/").pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.roles$.next(roles))
    );
  }

  getUser(id: number): Observable<User> {
    return this.apiService
      .get<User>(`/auth/users/${id}/`)
      .pipe(map(user => plainToInstance(User, user)));
  }

  saveProfile(newProfile: Partial<User>): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile => this.apiService.put<User>(`/auth/users/${profile.id}/`, newProfile))
    );
  }
}
