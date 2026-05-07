/** @format */

import { DomainEvent } from "../../shared/domain-event";

/**
 * Событие принятия приглашения в проект
 * Излучается когда пользователь принимает приглашение присоединиться к проекту
 */
export interface AcceptInvite extends DomainEvent {
  readonly type: "AcceptInvite";
  readonly payload: {
    readonly inviteId: number;
    readonly projectId: number;
    readonly userId: number;
    readonly role: string;
  };
}

export function acceptInvite(
  inviteId: number,
  projectId: number,
  userId: number,
  role: string
): AcceptInvite {
  return {
    type: "AcceptInvite",
    payload: {
      inviteId,
      projectId,
      userId,
      role,
    },
    occurredAt: new Date(),
  };
}
