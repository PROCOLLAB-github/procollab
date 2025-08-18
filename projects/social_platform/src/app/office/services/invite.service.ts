/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { concatMap, map, Observable, take } from "rxjs";
import { plainToInstance } from "class-transformer";
import { Invite } from "@models/invite.model";
import { HttpParams } from "@angular/common/http";
import { AuthService } from "@auth/services";

/**
 * Сервис для управления приглашениями в проекты
 *
 * Предоставляет функциональность для:
 * - Отправки приглашений пользователям в проекты
 * - Принятия и отклонения приглашений
 * - Отзыва отправленных приглашений
 * - Обновления информации о приглашениях
 * - Получения списков приглашений для пользователей и проектов
 */
@Injectable({
  providedIn: "root",
})
export class InviteService {
  private readonly INVITES_URL = "/invites";

  constructor(private readonly apiService: ApiService, private readonly authService: AuthService) {}

  /**
   * Отправляет приглашение пользователю для участия в проекте
   *
   * @param userId - идентификатор пользователя, которому отправляется приглашение
   * @param projectId - идентификатор проекта, в который приглашается пользователь
   * @param role - роль пользователя в проекте (например, "developer", "designer")
   * @param specialization - специализация пользователя в проекте (необязательно)
   * @returns Observable<Invite> - созданное приглашение со всеми полями
   */
  sendForUser(
    userId: number,
    projectId: number,
    role: string,
    specialization?: string
  ): Observable<Invite> {
    return this.apiService
      .post(`${this.INVITES_URL}/`, { user: userId, project: projectId, role, specialization })
      .pipe(map(profile => plainToInstance(Invite, profile)));
  }

  /**
   * Отзывает (удаляет) отправленное приглашение
   * Используется отправителем приглашения для его отмены
   *
   * @param invitationId - идентификатор приглашения для отзыва
   * @returns Observable<Invite> - информация об отозванном приглашении
   */
  revokeInvite(invitationId: number): Observable<Invite> {
    return this.apiService.delete(`${this.INVITES_URL}/${invitationId}`);
  }

  /**
   * Принимает приглашение в проект
   * Используется получателем приглашения для присоединения к проекту
   *
   * @param inviteId - идентификатор приглашения для принятия
   * @returns Observable<Invite> - информация о принятом приглашении
   */
  acceptInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/${inviteId}/accept/`, {});
  }

  /**
   * Отклоняет приглашение в проект
   * Используется получателем приглашения для отказа от участия
   *
   * @param inviteId - идентификатор приглашения для отклонения
   * @returns Observable<Invite> - информация об отклоненном приглашении
   */
  rejectInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/${inviteId}/decline/`, {});
  }

  /**
   * Обновляет информацию о приглашении (роль и специализацию)
   * Используется отправителем для изменения условий приглашения
   *
   * @param inviteId - идентификатор приглашения для обновления
   * @param role - новая роль в проекте
   * @param specialization - новая специализация (необязательно)
   * @returns Observable<Invite> - обновленное приглашение
   */
  updateInvite(inviteId: number, role: string, specialization?: string): Observable<Invite> {
    return this.apiService.patch(`${this.INVITES_URL}/${inviteId}`, { role, specialization });
  }

  /**
   * Получает список приглашений для текущего пользователя
   * Использует профиль текущего пользователя для фильтрации приглашений
   *
   * @returns Observable<Invite[]> - массив приглашений, адресованных текущему пользователю
   */
  getMy(): Observable<Invite[]> {
    return this.authService.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.get<Invite[]>(
          `${this.INVITES_URL}/`,
          new HttpParams({ fromObject: { user_id: profile.id } })
        )
      ),
      map(invites => plainToInstance(Invite, invites))
    );
  }

  /**
   * Получает список всех приглашений для конкретного проекта
   * Используется владельцами проекта для просмотра отправленных приглашений
   *
   * @param projectId - идентификатор проекта
   * @returns Observable<Invite[]> - массив всех приглашений, связанных с проектом
   */
  getByProject(projectId: number): Observable<Invite[]> {
    return this.apiService
      .get<Invite[]>(
        `${this.INVITES_URL}/`,
        new HttpParams({ fromObject: { project: projectId, user: "any" } })
      )
      .pipe(map(profiles => plainToInstance(Invite, profiles)));
  }
}
