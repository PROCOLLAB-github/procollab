/** @format */
import { Provider } from "@angular/core";
import { EvaluationRepositoryPort } from "@domain/program/ports/evaluation.repository.port";
import { EvaluationRepository } from "../../repository/program/evaluation.repository";
export const EVALUATION_PROVIDERS: Provider[] = [
  { provide: EvaluationRepositoryPort, useExisting: EvaluationRepository },
];
