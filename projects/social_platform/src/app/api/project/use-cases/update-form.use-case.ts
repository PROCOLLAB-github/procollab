/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { fail, ok, Result } from "@domain/shared/result.type";
import { Project } from "@domain/project/project.model";
import { UpdateFormCommand } from "@domain/project/commands/update-form.command";

export type UpdateFormError = { kind: "network"; status: 0 } | { kind: "unknown"; cause?: unknown };

@Injectable({ providedIn: "root" })
export class UpdateFormUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);

  execute({ id, data }: UpdateFormCommand): Observable<Result<Project, UpdateFormError>> {
    return this.projectRepositoryPort.update(id, data).pipe(
      map(project => ok<Project>(project)),
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 0) {
          return of(fail<UpdateFormError>({ kind: "network", status: 0 }));
        }
        return of(fail<UpdateFormError>({ kind: "unknown", cause: error }));
      })
    );
  }
}
