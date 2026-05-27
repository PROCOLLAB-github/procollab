/** @format */

import { DomainEvent } from "../../shared/domain-event";

/**
 * Событие отзыва приглашения.
 * Payload минимальный — бэк возвращает 204, projectId/userId на момент эмита недоступны.
 * Слушатели резолвят их по `inviteId` через свой кеш.
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
