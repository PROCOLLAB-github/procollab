/** @format */

import { DomainEvent } from "../../shared/domain-event";
import { TaskAnswerResponse } from "../courses.model";

export interface TaskAnswerSubmitted extends DomainEvent {
  readonly type: "TaskAnswerSubmitted";
  readonly payload: {
    readonly taskId: number;
    readonly lessonId: number;
    readonly response: TaskAnswerResponse;
  };
}

export function taskAnswerSubmitted(
  taskId: number,
  lessonId: number,
  response: TaskAnswerResponse
): TaskAnswerSubmitted {
  return {
    type: "TaskAnswerSubmitted",
    payload: { taskId, lessonId, response },
    occurredAt: new Date(),
  };
}
