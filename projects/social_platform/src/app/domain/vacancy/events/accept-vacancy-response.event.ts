/** @format */

import { DomainEvent } from "../../shared/domain-event";

/**
 * Событие принятия отклика на вакансию
 * Излучается когда рекрутер одобряет отклик кандидата на вакансию
 */
export interface AcceptVacancyResponse extends DomainEvent {
  readonly type: "AcceptVacancyResponse";
  readonly payload: {
    readonly vacancyResponseId: number;
    readonly vacancyId: number;
    readonly projectId: number;
    readonly userId: number;
  };
}

export function acceptVacancyResponse(
  vacancyResponseId: number,
  vacancyId: number,
  projectId: number,
  userId: number
): AcceptVacancyResponse {
  return {
    type: "AcceptVacancyResponse",
    payload: {
      vacancyResponseId,
      vacancyId,
      projectId,
      userId,
    },
    occurredAt: new Date(),
  };
}
