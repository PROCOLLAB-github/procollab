/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthHttpAdapter } from "../../adapters/auth/auth-http.adapter";
import { User, UserRole } from "@domain/auth/user.model";
import { concatMap, map, Observable, ReplaySubject, take, tap } from "rxjs";
import { LoginResponse, RegisterResponse } from "@domain/auth/http.model";
import { plainToInstance } from "class-transformer";
import { TokenService } from "@corelib";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { LoginCommand } from "@domain/auth/commands/login.command";
import { RegisterCommand } from "@domain/auth/commands/register.command";

@Injectable({ providedIn: "root" })
export class AuthRepository implements AuthRepositoryPort {
  private readonly authAdapter = inject(AuthHttpAdapter);
  private readonly tokenService = inject(TokenService);

  /** Поток данных профиля пользователя */
  private profile$ = new ReplaySubject<User>(1);
  profile = this.profile$.asObservable();

  /** Поток доступных ролей пользователей */
  private roles$ = new ReplaySubject<UserRole[]>(1);
  roles = this.roles$.asObservable();

  /** Поток ролей, которые может изменить текущий пользователь */
  private changeableRoles$ = new ReplaySubject<UserRole[]>(1);
  changeableRoles = this.changeableRoles$.asObservable();

  login({ email, password }: LoginCommand): Observable<LoginResponse> {
    return this.authAdapter
      .login({ email, password })
      .pipe(map(json => plainToInstance(LoginResponse, json)));
  }

  logout(): Observable<void> {
    return this.authAdapter.logout().pipe(map(() => this.tokenService.clearTokens()));
  }

  register(data: RegisterCommand): Observable<RegisterResponse> {
    return this.authAdapter
      .register(data)
      .pipe(map(json => plainToInstance(RegisterResponse, json)));
  }

  resendEmail(email: string): Observable<User> {
    return this.authAdapter.resendEmail(email).pipe(map(user => plainToInstance(User, user)));
  }

  fetchUser(id: number): Observable<User> {
    return this.authAdapter.getUser(id).pipe(map(user => plainToInstance(User, user)));
  }

  fetchProfile(): Observable<User> {
    return this.authAdapter.getProfile().pipe(
      map(user => plainToInstance(User, user)),
      tap(profile => this.profile$.next(profile))
    );
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.authAdapter.saveProfile(data).pipe(tap(user => this.profile$.next(user)));
  }

  updateOnboardingStage(stage: number | null): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile => this.authAdapter.setOnboardingStage(stage, profile.id)),
      tap(user => this.profile$.next(user))
    );
  }

  updateAvatar(url: string): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile => this.authAdapter.saveAvatar(url, profile.id)),
      tap(user => this.profile$.next(user))
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
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.roles$.next(roles))
    );
  }

  fetchChangeableRoles(): Observable<UserRole[]> {
    return this.authAdapter.getChangeableRoles().pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.changeableRoles$.next(roles))
    );
  }

  resetPassword(email: string): Observable<void> {
    return this.authAdapter.resetPassword(email);
  }

  setPassword(password: string, token: string): Observable<void> {
    return this.authAdapter.setPassword(password, token);
  }
}
