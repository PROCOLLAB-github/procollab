/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthHttpAdapter } from "../../adapters/auth/auth-http.adapter";
import { User, UserInput, UserRole } from "@domain/auth/user.model";
import {
  BehaviorSubject,
  concatMap,
  map,
  Observable,
  ReplaySubject,
  switchAll,
  take,
  tap,
} from "rxjs";
import { LoginResponse, RegisterResponse } from "@core/lib/models/auth/http.model";
import { plainToInstance } from "class-transformer";
import { TokenService } from "@corelib";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { LoginCommand } from "@domain/auth/commands/login.command";
import { RegisterCommand } from "@domain/auth/commands/register.command";
import { ChatStateService } from "@api/chat/chat-state.service";
import { userFromRaw, userToRaw } from "@utils/userRaw";

/** Репозиторий auth: HTTP через `AuthHttpAdapter`, `plainToInstance`; потоки profile/roles держит в ReplaySubject. */
@Injectable({ providedIn: "root" })
export class AuthRepository implements AuthRepositoryPort {
  private readonly authAdapter = inject(AuthHttpAdapter);
  private readonly tokenService = inject(TokenService);
  private readonly chatStateService = inject(ChatStateService);

  private profileLoaded = false;

  /** Поток данных профиля пользователя */
  private profileSubject = new ReplaySubject<User>(1);
  private readonly profileStore$ = new BehaviorSubject<ReplaySubject<User>>(this.profileSubject);
  profile = this.profileStore$.pipe(switchAll());

  /** Поток доступных ролей пользователей */
  private rolesSubject = new ReplaySubject<UserRole[]>(1);
  private readonly rolesStore$ = new BehaviorSubject<ReplaySubject<UserRole[]>>(this.rolesSubject);
  roles = this.rolesStore$.pipe(switchAll());

  /** Поток ролей, которые может изменить текущий пользователь */
  private changeableRolesSubject = new ReplaySubject<UserRole[]>(1);
  private readonly changeableRolesStore$ = new BehaviorSubject<ReplaySubject<UserRole[]>>(
    this.changeableRolesSubject
  );
  changeableRoles = this.changeableRolesStore$.pipe(switchAll());

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
    if (this.profileLoaded) {
      return this.profile.pipe(take(1));
    }

    return this.authAdapter.getProfile().pipe(
      map(user => userFromRaw(user)),
      tap(profile => {
        this.profileSubject.next(profile);
        this.profileLoaded = true;
      })
    );
  }

  updateProfile(data: UserInput): Observable<User> {
    const rawData = userToRaw(data);
    const saveProfile = (profileData: UserInput) =>
      this.authAdapter.saveProfile(userToRaw(profileData)).pipe(
        map(user => userFromRaw(user)),
        tap(user => this.profileSubject.next(user))
      );

    if (rawData.id !== undefined) {
      return saveProfile(rawData);
    }

    return this.profile.pipe(
      take(1),
      concatMap(profile => saveProfile({ ...rawData, id: profile.id }))
    );
  }

  updateOnboardingStage(stage: number | null): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile => this.authAdapter.setOnboardingStage(stage, profile.id)),
      map(user => userFromRaw(user)),
      tap(user => this.profileSubject.next(user))
    );
  }

  updateAvatar(url: string): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile => this.authAdapter.saveAvatar(url, profile.id)),
      map(user => userFromRaw(user)),
      tap(user => this.profileSubject.next(user))
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
      tap(roles => this.rolesSubject.next(roles))
    );
  }

  fetchChangeableRoles(): Observable<UserRole[]> {
    return this.authAdapter.getChangeableRoles().pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.changeableRolesSubject.next(roles))
    );
  }

  resetPassword(email: string): Observable<void> {
    return this.authAdapter.resetPassword(email);
  }

  setPassword(password: string, token: string): Observable<void> {
    return this.authAdapter.setPassword(password, token);
  }

  resetProfileCache(): void {
    this.profileLoaded = false;

    this.profileSubject = new ReplaySubject<User>(1);
    this.rolesSubject = new ReplaySubject<UserRole[]>(1);
    this.changeableRolesSubject = new ReplaySubject<UserRole[]>(1);

    this.profileStore$.next(this.profileSubject);
    this.rolesStore$.next(this.rolesSubject);
    this.changeableRolesStore$.next(this.changeableRolesSubject);
  }
}
