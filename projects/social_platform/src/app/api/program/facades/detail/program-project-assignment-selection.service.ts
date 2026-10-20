/** @format */
import { Injectable } from "@angular/core";

/** Короткоживущий переход между таблицей проектов и существующим редактором назначений. */
@Injectable({ providedIn: "root" })
export class ProgramProjectAssignmentSelection {
  private value: { programId: number; projectIds: number[] } | null = null;
  set(programId: number, projectIds: number[]): void {
    this.value = { programId, projectIds };
  }
  take(programId: number): number[] | null {
    const value = this.value;
    this.value = null;
    return value?.programId === programId ? value.projectIds : null;
  }
}
