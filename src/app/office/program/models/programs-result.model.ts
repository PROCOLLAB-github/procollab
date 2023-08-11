/** @format */

import { Program } from "@office/program/models/program.model";

export class ProgramsResult {
  count!: number;
  next!: string;
  previous!: string;
  results!: Program[];

  static default(): ProgramsResult {
    return {
      count: 1,
      next: "",
      previous: "",
      results: Array(10).fill(Program.default()),
    };
  }
}
