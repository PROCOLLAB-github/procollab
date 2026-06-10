/** @format */

import { DomainEvent } from "../../shared/domain-event";
import { Project } from "../project.model";

export interface ProjectCreated extends DomainEvent {
  readonly type: "ProjectCreated";
  readonly payload: {
    readonly projectId: number;
    readonly project: Project;
  };
}

export function projectCreated(project: Project): ProjectCreated {
  return {
    type: "ProjectCreated",
    payload: { projectId: project.id, project },
    occurredAt: new Date(),
  };
}
