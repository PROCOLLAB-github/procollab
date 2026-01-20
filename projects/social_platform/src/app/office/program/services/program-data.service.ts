/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Program } from "../../../domain/program/program.model";

@Injectable({
  providedIn: "root",
})
export class ProgramDataService {
  private programSubject$ = new BehaviorSubject<Program | undefined>(undefined);
  program$ = this.programSubject$.asObservable();

  setProgram(program: Program): void {
    return this.programSubject$.next(program);
  }

  getProgramName(): string {
    const program = this.programSubject$.value;
    if (!program?.name) return "";
    return program.name;
  }
}
