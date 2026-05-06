/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { Project } from "@domain/project/project.model";
import { UpdateFormCommand } from "@domain/project/commands/update-form.command";

@Injectable({ providedIn: "root" })
export class UpdateFormUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);

  execute({
    id,
    data,
  }: UpdateFormCommand): Observable<Result<Project, { kind: "unknown"; cause?: unknown }>> {
    return this.projectRepositoryPort.update(id, data).pipe(
      map(project => ok<Project>(project)),
      catchError(error => of(fail({ kind: "unknown" as const, cause: error })))
    );
  }
}
