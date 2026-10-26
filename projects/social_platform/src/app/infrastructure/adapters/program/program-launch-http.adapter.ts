/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { ProgramLaunchRepositoryPort } from "@domain/program/ports/program-launch.repository.port";
import {
  ManagedProgram,
  ManagedProgramsPage,
  ManagedProgramsQuery,
  ProgramCreation,
  ProgramLaunch,
  ProgramPreview,
} from "@domain/program/program-launch.model";

@Injectable()
export class ProgramLaunchHttpAdapter implements ProgramLaunchRepositoryPort {
  private readonly api = inject(ApiService);
  capabilities() {
    return this.api.get<{ canCreateProgram: boolean }>("/programs/capabilities/");
  }
  create(body: ProgramCreation) {
    return this.api.post<ManagedProgram>("/programs/drafts/", body);
  }
  managed(query: ManagedProgramsQuery) {
    return this.api.get<ManagedProgramsPage>(
      "/programs/managed/",
      new HttpParams()
        .set("search", query.search)
        .set("limit", query.limit)
        .set("offset", query.offset),
    );
  }
  readiness(id: number) {
    return this.api.get<ProgramLaunch>(`/programs/${id}/management/launch/`);
  }
  publish(id: number, revision: string) {
    return this.api.post<ProgramLaunch>(`/programs/${id}/management/publish/`, { revision });
  }
  preview(id: number) {
    return this.api.get<ProgramPreview>(`/programs/${id}/management/preview/`);
  }
}
