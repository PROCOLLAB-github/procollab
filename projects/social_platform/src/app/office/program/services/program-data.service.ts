/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { Program } from "../models/program.model";

@Injectable({
  providedIn: "root",
})
export class ProgramDataService {
  program = signal<Program | undefined>(undefined);

  setProgram(program: Program): void {
    return this.program.set(program);
  }

  programDateFinished = computed(() => {
    const program = this.program();
    return program?.datetimeFinished ? Date.now() > Date.parse(program.datetimeFinished) : false;
  });

  registerDateExpired = computed(() => {
    const program = this.program();
    return program?.datetimeRegistrationEnds
      ? Date.now() > Date.parse(program.datetimeRegistrationEnds)
      : false;
  });
}
