/** @format */

import { Observable } from "rxjs";
import {
  CreateSolutionCommand,
  ProgramSolution,
  SolutionContext,
  SolutionPage,
} from "../solution-contract.model";

export abstract class SolutionRepositoryPort {
  abstract context(programId: number): Observable<SolutionContext>;
  abstract create(programId: number, command: CreateSolutionCommand): Observable<ProgramSolution>;
  abstract get(programId: number, solutionId: number): Observable<ProgramSolution>;
  abstract list(programId: number, query?: SolutionListQuery): Observable<SolutionPage>;
}

export type SolutionListQuery = {
  search?: string;
  submission?: "all" | "submitted" | "not_submitted";
  limit?: number;
  offset?: number;
};

export function validSolutionId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
