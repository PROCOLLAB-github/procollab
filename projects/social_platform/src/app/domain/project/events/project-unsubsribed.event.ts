/** @format */

import { DomainEvent } from "../../shared/domain-event";

export interface ProjectUnSubscribed extends DomainEvent {
  readonly type: "ProjectUnSubscribed";
  readonly payload: {
    readonly projectId: number;
  };
}

export function projectUnSubscribed(projectId: number): ProjectUnSubscribed {
  return {
    type: "ProjectUnSubscribed",
    payload: {
      projectId,
    },
    occurredAt: new Date(),
  };
}
