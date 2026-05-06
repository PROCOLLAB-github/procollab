/** @format */

import { Observable } from "rxjs";
import { User, UserRole } from "../user.model";
import { LoginResponse, RegisterResponse } from "../http.model";
import { ApiPagination } from "../../other/api-pagination.model";
import { Project } from "../../project/project.model";
import { LoginCommand } from "../commands/login.command";
import { RegisterCommand } from "../commands/register.command";

/**
 * Порт репозитория аутентификации.
 * Определяет контракт для работы с данными пользователя.
 * Реализуется в infrastructure/repository/auth/auth.repository.ts
 */
export abstract class AuthRepositoryPort {
  /** Поток данных текущего профиля */
  abstract readonly profile: Observable<User>;
  /** Поток доступных ролей */
  abstract readonly roles: Observable<UserRole[]>;
  /** Поток изменяемых ролей */
  abstract readonly changeableRoles: Observable<UserRole[]>;

  abstract login(data: LoginCommand): Observable<LoginResponse>;
  abstract logout(): Observable<void>;
  abstract register(data: RegisterCommand): Observable<RegisterResponse>;
  abstract resendEmail(email: string): Observable<User>;
  abstract fetchUser(id: number): Observable<User>;
  abstract fetchProfile(): Observable<User>;
  abstract updateProfile(data: Partial<User>): Observable<User>;
  abstract updateOnboardingStage(stage: number | null): Observable<User>;
  abstract updateAvatar(url: string): Observable<User>;
  abstract fetchLeaderProjects(): Observable<ApiPagination<Project>>;
  abstract fetchUserRoles(): Observable<UserRole[]>;
  abstract fetchChangeableRoles(): Observable<UserRole[]>;
  abstract downloadCV(): Observable<Blob>;
  abstract resetPassword(email: string): Observable<void>;
  abstract setPassword(password: string, token: string): Observable<void>;
}
