/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { catchError, map, of } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { fail, ok } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetPublishedProgramProjectsUseCase {
  private readonly repository = inject(ProgramRepositoryPort);
  execute(programId: number, search: string, offset: number) {
    return this.repository
      .getPublishedProjects(
        programId,
        new HttpParams().set("search", search).set("limit", 20).set("offset", offset),
      )
      .pipe(
        map(value => ok(value)),
        catchError(() => of(fail({ kind: "unavailable" as const }))),
      );
  }
}
