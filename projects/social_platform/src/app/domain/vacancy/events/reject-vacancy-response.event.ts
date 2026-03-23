/** @format */

import { DomainEvent } from "../../shared/domain-event";

/**
 * Событие отклонения отклика на вакансию
 * Излучается когда рекрутер отклоняет отклик кандидата на вакансию
 */
export interface RejectVacancyResponse extends DomainEvent {
  readonly type: "RejectVacancyResponse";
  readonly payload: {
    readonly vacancyResponseId: number;
    readonly vacancyId: number;
    readonly projectId: number;
    readonly userId: number;
  };
}

export function rejectVacancyResponse(
  vacancyResponseId: number,
  vacancyId: number,
  projectId: number,
  userId: number
): RejectVacancyResponse {
  return {
    type: "RejectVacancyResponse",
    payload: {
      vacancyResponseId,
      vacancyId,
      projectId,
      userId,
    },
    occurredAt: new Date(),
  };
}
