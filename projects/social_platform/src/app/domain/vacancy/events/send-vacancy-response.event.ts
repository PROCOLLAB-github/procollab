/** @format */

import { DomainEvent } from "../../shared/domain-event";

export interface SendVacancyResponse extends DomainEvent {
  readonly type: "SendVacancyResponse";
  readonly payload: {
    readonly vacancyResponseId: number;
    readonly vacancyId: number;
    readonly projectId: number;
    readonly userId: number;
    readonly isApproved: boolean;
  };
}

export function sendVacancyResponse(
  vacancyResponseId: number,
  vacancyId: number,
  projectId: number,
  userId: number,
  isApproved: boolean
): SendVacancyResponse {
  return {
    type: "SendVacancyResponse",
    payload: {
      vacancyResponseId,
      vacancyId,
      projectId,
      userId,
      isApproved,
    },
    occurredAt: new Date(),
  };
}
