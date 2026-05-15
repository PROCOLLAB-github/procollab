/** @format */

import { DomainEvent } from "../../shared/domain-event";

/**
 * Событие отзыва приглашения в проект
 * Излучается когда инициатор отзывает отправленное приглашение.
 *
 * Payload — минимальный: бэк на revoke возвращает 204, информация о projectId/userId
 * на момент эмита недоступна. Слушатели, которым нужны эти данные, должны
 * резолвить их сами по `inviteId` через свой кеш.
 */
export interface RevokeInvite extends DomainEvent {
  readonly type: "RevokeInvite";
  readonly payload: {
    readonly inviteId: number;
  };
}

export function revokeInvite(inviteId: number): RevokeInvite {
  return {
    type: "RevokeInvite",
    payload: { inviteId },
    occurredAt: new Date(),
  };
}
