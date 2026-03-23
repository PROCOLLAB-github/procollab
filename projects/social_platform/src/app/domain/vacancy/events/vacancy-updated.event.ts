/** @format */

import { CreateVacancyDto } from "../../../api/project/dto/create-vacancy.model";
import { DomainEvent } from "../../shared/domain-event";
import { Vacancy } from "../vacancy.model";

export interface VacancyUpdated extends DomainEvent {
  readonly type: "VacancyUpdated";
  readonly payload: {
    readonly vacancyId: number;
    readonly vacancy: Partial<Vacancy> | CreateVacancyDto;
  };
}

export function vacancyUpdated(
  vacancyId: number,
  vacancy: Partial<Vacancy> | CreateVacancyDto
): VacancyUpdated {
  return {
    type: "VacancyUpdated",
    payload: {
      vacancyId,
      vacancy,
    },
    occurredAt: new Date(),
  };
}
