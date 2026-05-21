/** @format */

import { CreateVacancyDto } from "@domain/vacancy/dto/create-vacancy.model";
import { DomainEvent } from "../../shared/domain-event";

export interface VacancyCreated extends DomainEvent {
  readonly type: "VacancyCreated";
  readonly payload: {
    readonly projectId: number;
    readonly vacancy: CreateVacancyDto;
  };
}

export function vacancyCreated(projectId: number, vacancy: CreateVacancyDto): VacancyCreated {
  return {
    type: "VacancyCreated",
    payload: {
      projectId,
      vacancy,
    },
    occurredAt: new Date(),
  };
}
