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
} from "../../domain/auth/http.model";
import { User, UserRole } from "../../domain/auth/user.model";
import { Project } from "../../domain/project/project.model";
import { ApiPagination } from "../../domain/other/api-pagination.model";

/**
 * Сервис аутентификации и управления пользователями
 *
 * Назначение: Основной сервис для всех операций аутентификации и работы с профилем пользователя
 * Принимает: Данные для входа, регистрации, сброса пароля, обновления профиля
 * Возвращает: Observable с результатами операций, данными пользователя, токенами
 *
 * Функциональность:
 * - Вход и выход из системы
 * - Регистрация новых пользователей
 * - Сброс и установка нового пароля
 * - Управление профилем пользователя (получение, обновление)
 * - Работа с ролями пользователей
 * - Управление аватаром пользователя
 * - Управление этапами онбординга
 * - Работа с подписками пользователя
 * - Скачивание и отправка резюме
 * - Повторная отправка письма подтверждения
 * - Использует RxJS для реактивного программирования
 * - Кэширует данные профиля в ReplaySubject
 */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_TOKEN_URL = "/api/token";
  private readonly AUTH_URL = "/auth";
  private readonly AUTH_USERS_URL = "/auth/users";

  constructor(private apiService: ApiService, private tokenService: TokenService) {}

  /**
   * Вход пользователя в систему
   * @param credentials Данные для входа (email и пароль)
   * @returns Observable с ответом сервера, содержащим токены
   */
  login({ email, password }: LoginRequest): Observable<LoginResponse> {
    return this.apiService
      .post(`${this.API_TOKEN_URL}/`, { email, password })
      .pipe(map(json => plainToInstance(LoginResponse, json)));
  }

  /**
   * Выход пользователя из системы
   * Отправляет refresh токен на сервер для инвалидации
   * @returns Observable завершения операции
   */
  logout(): Observable<void> {
    return this.apiService
      .post(`${this.AUTH_URL}/logout/`, { refreshToken: this.tokenService.getTokens()?.refresh })
      .pipe(map(() => this.tokenService.clearTokens()));
  }

  /**
   * Регистрация нового пользователя
   * @param data Данные для регистрации (email, пароль, имя и т.д.)
   * @returns Observable с данными зарегистрированного пользователя
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService
      .post(`${this.AUTH_USERS_URL}/`, data)
      .pipe(map(json => plainToInstance(RegisterResponse, json)));
  }

  downloadCV() {
    return this.apiService.getFile(`${this.AUTH_USERS_URL}/download_cv/`);
  }

  /** Поток данных профиля пользователя */
  private profile$ = new ReplaySubject<User>(1);
  profile = this.profile$.asObservable();

  /** Поток доступных ролей пользователей */
  private roles$ = new ReplaySubject<UserRole[]>(1);
  roles = this.roles$.asObservable();

  /** Поток ролей, которые может изменить текущий пользователь */
  private changeableRoles$ = new ReplaySubject<UserRole[]>(1);
  changeableRoles = this.changeableRoles$.asObservable();

  /**
   * Получить профиль текущего пользователя
   * @returns Observable с данными профиля
   */
  getProfile(): Observable<User> {
    return this.apiService.get<User>(`${this.AUTH_USERS_URL}/current/`).pipe(
      map(user => plainToInstance(User, user)),
      tap(profile => this.profile$.next(profile))
    );
  }

  /**
   * Проверить, есть ли у пользователя активная подписка
   * @returns Observable с булевым значением статуса подписки
   */
  isSubscribed(): Observable<boolean> {
    return this.profile.pipe(map(profile => profile.isSubscribed));
  }

  /**
   * Получить список всех типов пользователей
   * @returns Observable с массивом ролей пользователей
   */
  getUserRoles(): Observable<UserRole[]> {
    return this.apiService.get<[[number, string]]>(`${this.AUTH_USERS_URL}/types/`).pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.roles$.next(roles))
    );
  }

  /**
   * Получить проекты где пользователь leader
   * @returns Observable проектов внутри профиля
   */
  getLeaderProjects(): Observable<ApiPagination<Project>> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/projects/leader/`);
  }

  /**
   * Получить роли, которые может изменить текущий пользователь
   * @returns Observable с массивом изменяемых ролей
   */
  getChangeableRoles(): Observable<UserRole[]> {
    return this.apiService.get<[[number, string]]>(`${this.AUTH_USERS_URL}/roles/`).pipe(
      map(roles => roles.map(role => ({ id: role[0], name: role[1] }))),
      map(roles => plainToInstance(UserRole, roles)),
      tap(roles => this.changeableRoles$.next(roles))
    );
  }

  /**
   * Получить данные пользователя по ID
   * @param id Идентификатор пользователя
   * @returns Observable с данными пользователя
   */
  getUser(id: number): Observable<User> {
    return this.apiService
      .get<User>(`${this.AUTH_USERS_URL}/${id}/`)
      .pipe(map(user => plainToInstance(User, user)));
  }

  /**
   * Сохранить аватар пользователя
   * @param url URL загруженного аватара
   * @returns Observable с обновленными данными пользователя
   */
  saveAvatar(url: string): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.patch<User>(`${this.AUTH_USERS_URL}/${profile.id}`, { avatar: url })
      )
    );
  }

  /**
   * Сохранить изменения в профиле пользователя
   * @param newProfile Частичные данные профиля для обновления
   * @returns Observable с обновленными данными профиля
   */
  saveProfile(newProfile: Partial<User>): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.patch<User>(`${this.AUTH_USERS_URL}/${profile.id}/`, newProfile)
      ),
      tap(profile => {
        this.profile$.next(profile);
      })
    );
  }

  /**
   * Установить этап онбординга для пользователя
   * @param stage Номер этапа онбординга (null для завершения)
   * @returns Observable с обновленными данными пользователя
   */
  setOnboardingStage(stage: number | null): Observable<User> {
    return this.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.put<User>(`${this.AUTH_USERS_URL}/${profile.id}/set_onboarding_stage/`, {
          onboardingStage: stage,
        })
      ),
      concatMap(() => this.profile.pipe(take(1))),
      tap(profile => {
        this.profile$.next({ ...profile, onboardingStage: stage } as User);
      })
    );
  }

  /**
   * Запросить сброс пароля
   * @param email Email для отправки ссылки сброса
   * @returns Observable завершения операции
   */
  resetPassword(email: string): Observable<any> {
    return this.apiService.post(`${this.AUTH_URL}/reset_password/`, { email });
  }

  /**
   * Установить новый пароль после сброса
   * @param password Новый пароль
   * @param token Токен подтверждения сброса пароля
   * @returns Observable завершения операции
   */
  setPassword(password: string, token: string): Observable<any> {
    return this.apiService.post(`${this.AUTH_URL}/reset_password/confirm/`, { password, token });
  }

  /**
   * Повторно отправить письмо подтверждения email
   * @param email Email для повторной отправки
   * @returns Observable с данными пользователя
   */
  resendEmail(email: string): Observable<User> {
    return this.apiService
      .post<User>(`${this.AUTH_URL}/resend_email/`, { email })
      .pipe(map(user => plainToInstance(User, user)));
  }
}
