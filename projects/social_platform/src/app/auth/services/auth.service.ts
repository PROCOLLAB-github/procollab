/** @format */

import { Injectable } from "@angular/core";
import { ApiService, TokenService } from "@corelib";
import { plainToInstance } from "class-transformer";
import { concatMap, map, Observable, ReplaySubject, take, tap } from "rxjs";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../models/http.model";
import { User, UserRole } from "../models/user.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private apiService: ApiService, private tokenService: TokenService) {}

  login({ email, password }: LoginRequest): Observable<LoginResponse> {
    return this.apiService
      .post("/api/token/", { email, password })
      .pipe(map(json => plainToInstance(LoginResponse, json)));
  }

  logout(): Observable<void> {
    return this.apiService
      .post("/auth/logout/", { refreshToken: this.tokenService.getTokens()?.refresh })
      .pipe(map(() => this.tokenService.clearTokens()));
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService
      .post("/auth/users/", data)
      .pipe(map(json => plainToInstance(RegisterResponse, json)));
  }

  downloadCV(): Observable<any> {
    return this.apiService.get("/auth/users/download_cv/", new HttpParams(), {
      responseType: "text",
      params: new HttpParams(),
    });
  }

  sendCV(): Observable<any> {
    return this.apiService.get("/auth/users/send_mail_cv/");
  }

  private profile$ = new ReplaySubject<User>(1);
  profile = this.profile$.asObservable();

  private roles$ = new ReplaySubject<UserRole[]>(1);
  roles = this.roles$.asObservable();

  private changeableRoles$ = new ReplaySubject<UserRole[]>(1);
  changeableRoles = this.changeableRoles$.asObservable();

  getProfile(): Observable<User> {
    return this.apiService.get<User>("/auth/users/current/").pipe(
      map(user => plainToInstance(User, user)),
      tap(profile => this.profile$.next(profile))
    );
  }

  isSubscribed(): Observable<boolean> {
    return this.profile.pipe(map(profile => profile.isSubscribed));
  }

  getUserRoles(): Observable<UserRole[]> {
    return this.apiService.get<[[number, string]]>("/auth/users/types/").pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.roles$.next(roles))
    );
  }

  getChangeableRoles(): Observable<UserRole[]> {
    return this.apiService.get<[[number, string]]>("/auth/users/roles/").pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.changeableRoles$.next(roles))
    );
  }

  getUser(id: number): Observable<User> {
    return this.apiService
      .get<User>(`/auth/users/${id}/`)
      .pipe(map(user => plainToInstance(User, user)));
  }

  saveAvatar(url: string): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.patch<User>(`/auth/users/${profile.id}`, { avatar: url })
      )
    );
  }

  saveProfile(newProfile: Partial<User>): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile => this.apiService.patch<User>(`/auth/users/${profile.id}/`, newProfile)),
      tap(profile => {
        this.profile$.next(profile);
      })
    );
  }

  setOnboardingStage(stage: number | null): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.put<User>(`/auth/users/${profile.id}/set_onboarding_stage/`, {
          onboardingStage: stage,
        })
      ),
      concatMap(() => this.profile.pipe(take(1))),
      tap(profile => {
        this.profile$.next({ ...profile, onboardingStage: stage } as User);
      })
    );
  }

  resetPassword(email: string): Observable<any> {
    return this.apiService.post("/auth/reset_password/", { email });
  }

  setPassword(password: string, token: string): Observable<any> {
    return this.apiService.post("/auth/reset_password/confirm/", { password, token });
  }

  resendEmail(email: string): Observable<User> {
    return this.apiService
      .post<User>("/auth/resend_email/", { email })
      .pipe(map(user => plainToInstance(User, user)));
  }
}
