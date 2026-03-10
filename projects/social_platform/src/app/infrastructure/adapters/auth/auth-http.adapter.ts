/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService, TokenService } from "@corelib";
import { Observable } from "rxjs";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../../../domain/auth/http.model";
import { User } from "../../../domain/auth/user.model";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { ProjectDto } from "../project/dto/project.dto";

@Injectable({ providedIn: "root" })
export class AuthHttpAdapter {
  private readonly API_TOKEN_URL = "/api/token";
  private readonly AUTH_URL = "/auth";
  private readonly AUTH_USERS_URL = "/auth/users";

  private readonly apiService = inject(ApiService);
  private readonly tokenService = inject(TokenService);

  /**
   * Вход пользователя в систему
   * @param credentials Данные для входа (email и пароль)
   * @returns Observable с ответом сервера, содержащим токены
   */
  login({ email, password }: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post(`${this.API_TOKEN_URL}/`, { email, password });
  }

  /**
   * Выход пользователя из системы
   * Отправляет refresh токен на сервер для инвалидации
   * @returns Observable завершения операции
   */
  logout(): Observable<void> {
    return this.apiService.post(`${this.AUTH_URL}/logout/`, {
      refreshToken: this.tokenService.getTokens()?.refresh,
    });
  }

  /**
   * Регистрация нового пользователя
   * @param data Данные для регистрации (email, пароль, имя и т.д.)
   * @returns Observable с данными зарегистрированного пользователя
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService.post(`${this.AUTH_USERS_URL}/`, data);
  }

  downloadCV(): Observable<Blob> {
    return this.apiService.getFile(`${this.AUTH_USERS_URL}/download_cv/`);
  }

  /**
   * Получить профиль текущего пользователя
   * @returns Observable с данными профиля
   */
  getProfile(): Observable<User> {
    return this.apiService.get<User>(`${this.AUTH_USERS_URL}/current/`);
  }

  /**
   * Получить список всех типов пользователей
   * @returns Observable с массивом ролей пользователей
   */
  getUserRoles(): Observable<[[number, string]]> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/types/`);
  }

  /**
   * Получить проекты где пользователь leader
   * @returns Observable проектов внутри профиля
   */
  getLeaderProjects(): Observable<ApiPagination<ProjectDto>> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/projects/leader/`);
  }

  /**
   * Получить роли, которые может изменить текущий пользователь
   * @returns Observable с массивом изменяемых ролей
   */
  getChangeableRoles(): Observable<[[number, string]]> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/roles/`);
  }

  /**
   * Получить данные пользователя по ID
   * @param id Идентификатор пользователя
   * @returns Observable с данными пользователя
   */
  getUser(id: number): Observable<User> {
    return this.apiService.get<User>(`${this.AUTH_USERS_URL}/${id}/`);
  }

  /**
   * Сохранить аватар пользователя
   * @param url URL загруженного аватара
   * @returns Observable с обновленными данными пользователя
   */
  saveAvatar(url: string, profileId: number): Observable<User> {
    return this.apiService.patch<User>(`${this.AUTH_USERS_URL}/${profileId}`, { avatar: url });
  }

  /**
   * Сохранить изменения в профиле пользователя
   * @param newProfile Частичные данные профиля для обновления
   * @returns Observable с обновленными данными профиля
   */
  saveProfile(newProfile: Partial<User>): Observable<User> {
    return this.apiService.patch<User>(`${this.AUTH_USERS_URL}/${newProfile.id}/`, newProfile);
  }

  /**
   * Установить этап онбординга для пользователя
   * @param stage Номер этапа онбординга (null для завершения)
   * @returns Observable с обновленными данными пользователя
   */
  setOnboardingStage(stage: number | null, profileId: number): Observable<User> {
    return this.apiService.put<User>(`${this.AUTH_USERS_URL}/${profileId}/set_onboarding_stage/`, {
      onboardingStage: stage,
    });
  }

  /**
   * Запросить сброс пароля
   * @param email Email для отправки ссылки сброса
   * @returns Observable завершения операции
   */
  resetPassword(email: string): Observable<void> {
    return this.apiService.post(`${this.AUTH_URL}/reset_password/`, { email });
  }

  /**
   * Установить новый пароль после сброса
   * @param password Новый пароль
   * @param token Токен подтверждения сброса пароля
   * @returns Observable завершения операции
   */
  setPassword(password: string, token: string): Observable<void> {
    return this.apiService.post(`${this.AUTH_URL}/reset_password/confirm/`, { password, token });
  }

  /**
   * Повторно отправить письмо подтверждения email
   * @param email Email для повторной отправки
   * @returns Observable с данными пользователя
   */
  resendEmail(email: string): Observable<User> {
    return this.apiService.post<User>(`${this.AUTH_URL}/resend_email/`, { email });
  }
}
