/** @format */

import { DomainEvent } from "../../shared/domain-event";

/**
 * Событие отзыва приглашения в проект
 * Излучается когда инициатор отзывает отправленное приглашение
 */
export interface RevokeInvite extends DomainEvent {
  readonly type: "RevokeInvite";
  readonly payload: {
    readonly inviteId: number;
    readonly projectId: number;
    readonly userId: number;
  };
}

export function revokeInvite(inviteId: number, projectId: number, userId: number): RevokeInvite {
  return {
    type: "RevokeInvite",
    payload: {
      inviteId,
      projectId,
      userId,
    },
    occurredAt: new Date(),
  };
}
