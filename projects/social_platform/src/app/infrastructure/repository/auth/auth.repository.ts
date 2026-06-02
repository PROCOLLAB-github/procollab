/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthHttpAdapter } from "../../adapters/auth/auth-http.adapter";
import { User, UserInput, UserRole } from "@domain/auth/user.model";
import { map, Observable, take, tap } from "rxjs";
import { LoginResponse, RegisterResponse } from "@core/lib/models/auth/http.model";
import { plainToInstance } from "class-transformer";
import { TokenService } from "@corelib";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { LoginCommand } from "@domain/auth/commands/login.command";
import { RegisterCommand } from "@domain/auth/commands/register.command";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { userFromRaw, userToRaw } from "@utils/userRaw";

/** Репозиторий auth: HTTP вызовы через `AuthHttpAdapter`, без кеша (fetchProfile() каждый раз ходит на сервер). */
@Injectable({ providedIn: "root" })
export class AuthRepository implements AuthRepositoryPort {
  private readonly authAdapter = inject(AuthHttpAdapter);
  private readonly tokenService = inject(TokenService);
  private readonly chatStateService = inject(ChatStateService);

  login({ email, password }: LoginCommand): Observable<LoginResponse> {
    return this.authAdapter
      .login({ email, password })
      .pipe(map(json => plainToInstance(LoginResponse, json)));
  }

  logout(): Observable<void> {
    return this.authAdapter.logout().pipe(
      tap(() => {
        this.tokenService.clearTokens();
        this.chatStateService.reset();
      })
    );
  }

  register(data: RegisterCommand): Observable<RegisterResponse> {
    return this.authAdapter
      .register(data)
      .pipe(map(json => plainToInstance(RegisterResponse, json)));
  }

  resendEmail(email: string): Observable<User> {
    return this.authAdapter.resendEmail(email).pipe(map(user => userFromRaw(user)));
  }

  fetchUser(id: number): Observable<User> {
    return this.authAdapter.getUser(id).pipe(map(user => userFromRaw(user)));
  }

  fetchProfile(): Observable<User> {
    return this.authAdapter.getProfile().pipe(map(user => userFromRaw(user)));
  }

  updateProfile(data: UserInput): Observable<User> {
    const rawData = userToRaw(data);
    return this.authAdapter.saveProfile(rawData).pipe(map(user => userFromRaw(user)));
  }

  updateOnboardingStage(stage: number | null, userId: number): Observable<User> {
    return this.authAdapter.setOnboardingStage(stage, userId).pipe(
      take(1),
      map(user => userFromRaw(user))
    );
  }

  updateAvatar(url: string, userId: number): Observable<User> {
    return this.authAdapter.saveAvatar(url, userId).pipe(
      take(1),
      map(user => userFromRaw(user))
    );
  }

  fetchLeaderProjects(): Observable<ApiPagination<Project>> {
    return this.authAdapter
      .getLeaderProjects()
      .pipe(map(page => ({ ...page, results: plainToInstance(Project, page.results) })));
  }

  downloadCV(): Observable<Blob> {
    return this.authAdapter.downloadCV();
  }

  fetchUserRoles(): Observable<UserRole[]> {
    return this.authAdapter.getUserRoles().pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles))
    );
  }

  fetchChangeableRoles(): Observable<UserRole[]> {
    return this.authAdapter.getChangeableRoles().pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles))
    );
  }

  resetPassword(email: string): Observable<void> {
    return this.authAdapter.resetPassword(email);
  }

  setPassword(password: string, token: string): Observable<void> {
    return this.authAdapter.setPassword(password, token);
  }
}
