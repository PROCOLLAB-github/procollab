/** @format */

import { Injectable, signal } from "@angular/core";
import { generateOptionsList } from "@utils/generate-options-list";
import { Program } from "projects/social_platform/src/app/domain/program/program.model";

@Injectable()
export class ProgramMainUIInfoService {
  readonly programCount = signal<number>(0);
  readonly isPparticipating = signal<boolean>(false);

  readonly programs = signal<Program[]>([]);

  readonly programOptionsFilter = generateOptionsList(4, "strings", [
    "все",
    "актуальные",
    "архив",
    "участвовал",
  ]);

  applyPrograms(programs: Program[], count: number): void {
    this.programCount.set(count);
    this.programs.set(programs);
  }
}
