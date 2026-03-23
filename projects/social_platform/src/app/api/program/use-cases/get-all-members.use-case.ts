/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramRepositoryPort } from "../../../domain/program/ports/program.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { User } from "../../../domain/auth/user.model";
import { ApiPagination } from "../../../domain/other/api-pagination.model";

@Injectable({ providedIn: "root" })
export class GetAllMembersUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    skip: number,
    take: number
  ): Observable<Result<ApiPagination<User>, { kind: "unknown" }>> {
    return this.programRepositoryPort.getAllMembers(programId, skip, take).pipe(
      map(members => ok<ApiPagination<User>>(members)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
