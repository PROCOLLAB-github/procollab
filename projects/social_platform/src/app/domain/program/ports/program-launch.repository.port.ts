/** @format */
import { Observable } from "rxjs";
import {
  ManagedProgram,
  ManagedProgramsPage,
  ManagedProgramsQuery,
  ProgramCreation,
  ProgramLaunch,
  ProgramPreview,
} from "../program-launch.model";

export abstract class ProgramLaunchRepositoryPort {
  abstract capabilities(): Observable<{ canCreateProgram: boolean }>;
  abstract create(body: ProgramCreation): Observable<ManagedProgram>;
  abstract managed(query: ManagedProgramsQuery): Observable<ManagedProgramsPage>;
  abstract readiness(id: number): Observable<ProgramLaunch>;
  abstract publish(id: number, revision: string): Observable<ProgramLaunch>;
  abstract preview(id: number): Observable<ProgramPreview>;
}
