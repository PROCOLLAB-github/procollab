/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService, TokenService } from "@corelib";
import { Observable } from "rxjs";
import { LoginResponse, RegisterResponse } from "@core/lib/models/auth/http.model";
import { User, UserRaw } from "@domain/auth/user.model";
import { ProjectDto } from "../project/dto/project.dto";
import { LoginCommand } from "@domain/auth/commands/login.command";
import { RegisterCommand } from "@domain/auth/commands/register.command";
import { ApiPagination } from "@domain/other/api-pagination.model";

/** HTTP-адаптер auth: `/api/token`, `/auth`, `/auth/users` (логин/регистрация/профиль/роли). */
@Injectable({ providedIn: "root" })
export class AuthHttpAdapter {
  private readonly API_TOKEN_URL = "/api/token";
  private readonly AUTH_URL = "/auth";
  private readonly AUTH_USERS_URL = "/auth/users";

  private readonly apiService = inject(ApiService);
  private readonly tokenService = inject(TokenService);

  login({ email, password }: LoginCommand): Observable<LoginResponse> {
    return this.apiService.post(`${this.API_TOKEN_URL}/`, { email, password });
  }

  /** Отправляет refresh токен на сервер для инвалидации. */
  logout(): Observable<void> {
    return this.apiService.post(`${this.AUTH_URL}/logout/`, {
      refreshToken: this.tokenService.getTokens()?.refresh,
    });
  }

  register(data: RegisterCommand): Observable<RegisterResponse> {
    return this.apiService.post(`${this.AUTH_USERS_URL}/`, data);
  }

  downloadCV(): Observable<Blob> {
    return this.apiService.getFile(`${this.AUTH_USERS_URL}/download_cv/`);
  }

  getProfile(): Observable<User> {
    return this.apiService.get<User>(`${this.AUTH_USERS_URL}/current/`);
  }

  getUserRoles(): Observable<[[number, string]]> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/types/`);
  }

  getLeaderProjects(): Observable<ApiPagination<ProjectDto>> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/projects/leader/`);
  }

  getChangeableRoles(): Observable<[[number, string]]> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/roles/`);
  }

  getUser(id: number): Observable<User> {
    return this.apiService.get<User>(`${this.AUTH_USERS_URL}/${id}/`);
  }

  saveAvatar(url: string, profileId: number): Observable<User> {
    return this.apiService.patch<User>(`${this.AUTH_USERS_URL}/${profileId}/`, { avatar: url });
  }

  saveProfile(newProfile: Partial<UserRaw>): Observable<User> {
    return this.apiService.patch<User>(`${this.AUTH_USERS_URL}/${newProfile.id}/`, newProfile);
  }

  setOnboardingStage(stage: number | null, profileId: number): Observable<User> {
    return this.apiService.put<User>(`${this.AUTH_USERS_URL}/${profileId}/set_onboarding_stage/`, {
      onboardingStage: stage,
    });
  }

  resetPassword(email: string): Observable<void> {
    return this.apiService.post(`${this.AUTH_URL}/reset_password/`, { email });
  }

  setPassword(password: string, token: string): Observable<void> {
    return this.apiService.post(`${this.AUTH_URL}/reset_password/confirm/`, { password, token });
  }

  resendEmail(email: string): Observable<User> {
    return this.apiService.post<User>(`${this.AUTH_URL}/resend_email/`, { email });
  }
}
