/** @format */

import { DomainEvent } from "../../shared/domain-event";

export interface RemoveProjectCollaborator extends DomainEvent {
  readonly type: "RemoveProjectCollaborator";
  readonly payload: {
    readonly projectId: number;
    readonly userId: number;
  };
}

export function removeProjectCollaborator(
  projectId: number,
  userId: number
): RemoveProjectCollaborator {
  return {
    type: "RemoveProjectCollaborator",
    payload: {
      projectId,
      userId,
    },
    occurredAt: new Date(),
  };
}
