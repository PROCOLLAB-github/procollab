/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { Invite } from "../../../domain/invite/invite.model";
import { HttpParams } from "@angular/common/http";

/**
 * Адаптер HTTP-запросов для управления приглашениями в проекты.
 * Выполняет только сетевые операции без доменного маппинга.
 */
@Injectable({ providedIn: "root" })
export class InviteHttpAdapter {
  private readonly INVITES_URL = "/invites";
  private readonly apiService = inject(ApiService);

  /**
   * Отправляет приглашение пользователю для участия в проекте.
   *
   * @param userId идентификатор пользователя, которому отправляется приглашение
   * @param projectId идентификатор проекта
   * @param role роль пользователя в проекте
   * @param specialization специализация пользователя (необязательно)
   */
  sendForUser(
    userId: number,
    projectId: number,
    role: string,
    specialization?: string
  ): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/`, {
      user: userId,
      project: projectId,
      role,
      specialization,
    });
  }

  /**
   * Отзывает (удаляет) отправленное приглашение.
   *
   * @param invitationId идентификатор приглашения
   */
  revokeInvite(invitationId: number): Observable<void> {
    return this.apiService.delete(`${this.INVITES_URL}/${invitationId}`);
  }

  /**
   * Принимает приглашение в проект.
   *
   * @param inviteId идентификатор приглашения
   */
  acceptInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/${inviteId}/accept/`, {});
  }

  /**
   * Отклоняет приглашение в проект.
   *
   * @param inviteId идентификатор приглашения
   */
  rejectInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/${inviteId}/decline/`, {});
  }

  /**
   * Обновляет информацию о приглашении.
   *
   * @param inviteId идентификатор приглашения
   * @param role новая роль
   * @param specialization новая специализация (необязательно)
   */
  updateInvite(inviteId: number, role: string, specialization?: string): Observable<Invite> {
    return this.apiService.patch(`${this.INVITES_URL}/${inviteId}`, { role, specialization });
  }

  /**
   * Получает приглашения текущего пользователя.
   */
  getMy(): Observable<Invite[]> {
    return this.apiService.get<Invite[]>(`${this.INVITES_URL}/`);
  }

  /**
   * Получает приглашения по проекту.
   *
   * @param projectId идентификатор проекта
   */
  getByProject(projectId: number): Observable<Invite[]> {
    return this.apiService.get<Invite[]>(
      `${this.INVITES_URL}/`,
      new HttpParams({ fromObject: { project: projectId, user: "any" } })
    );
  }
}
