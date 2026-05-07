/** @format */

import { DomainEvent } from "../../shared/domain-event";

export interface ProjectSubscribed extends DomainEvent {
  readonly type: "ProjectSubscribed";
  readonly payload: {
    readonly projectId: number;
  };
}

export function projectSubscribed(projectId: number): ProjectSubscribed {
  return {
    type: "ProjectSubscribed",
    payload: {
      projectId,
    },
    occurredAt: new Date(),
  };
}
