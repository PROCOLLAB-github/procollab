/** @format */

import { DomainEvent } from "../../shared/domain-event";

export interface VacancyDelete extends DomainEvent {
  readonly type: "VacancyDelete";
  readonly payload: {
    readonly vacancyId: number;
  };
}

export function vacancyDelete(vacancyId: number): VacancyDelete {
  return {
    type: "VacancyDelete",
    payload: {
      vacancyId,
    },
    occurredAt: new Date(),
  };
}
