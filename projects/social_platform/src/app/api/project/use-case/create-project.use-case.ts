/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "../../../domain/project/ports/project.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { Project } from "../../../domain/project/project.model";

@Injectable({ providedIn: "root" })
export class CreateProjectUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);

  execute(): Observable<Result<Project, { kind: "unknown" }>> {
    return this.projectRepositoryPort.postOne().pipe(
      map(project => ok<Project>(project)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }

  compile() {
    this.projectRepositoryPort.count$.next({
      ...this.projectRepositoryPort.count$.getValue(),
      my: this.projectRepositoryPort.count$.getValue().my + 1,
    });
  }
}
