/** @format */

import { DomainEvent } from "../../shared/domain-event";

export interface ProjectDeleted extends DomainEvent {
  readonly type: "ProjectDeleted";
  readonly payload: {
    readonly projectId: number;
  };
}

export function projectDeleted(projectId: number): ProjectDeleted {
  return {
    type: "ProjectDeleted",
    payload: { projectId },
    occurredAt: new Date(),
  };
}
