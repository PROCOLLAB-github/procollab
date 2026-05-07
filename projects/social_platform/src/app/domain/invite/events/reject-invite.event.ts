/** @format */

import { DomainEvent } from "../../shared/domain-event";

/**
 * Событие отклонения приглашения в проект
 * Излучается когда пользователь отклоняет приглашение присоединиться к проекту
 */
export interface RejectInvite extends DomainEvent {
  readonly type: "RejectInvite";
  readonly payload: {
    readonly inviteId: number;
    readonly projectId: number;
    readonly userId: number;
  };
}

export function rejectInvite(inviteId: number, projectId: number, userId: number): RejectInvite {
  return {
    type: "RejectInvite",
    payload: {
      inviteId,
      projectId,
      userId,
    },
    occurredAt: new Date(),
  };
}
