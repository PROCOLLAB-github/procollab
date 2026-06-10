/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { FormArray } from "@angular/forms";

/** UI-состояние целей проекта в форме редактирования. */
@Injectable({ providedIn: "root" })
export class ProjectGoalsUIService {
  readonly goalLeaderShowModal = signal<boolean>(false);
  readonly activeGoalIndex = signal<number | null>(null);
  readonly selectedLeaderId = signal<string>("");

  readonly goalItems = signal<any[]>([]);

  readonly hasGoals = computed(() => this.goalItems().length > 0);

  applyOnLeaderRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedLeaderId.set(target.value);
  }

  applyAddLeaderToGoal(goals: FormArray): void {
    const goalIndex = this.activeGoalIndex();
    const leaderId = this.selectedLeaderId();

    if (goalIndex === null || !leaderId) {
      return;
    }

    const goalFormGroup = goals.at(goalIndex);
    goalFormGroup?.get("responsible")?.setValue(leaderId);

    this.applyCloseGoalLeaderModal();
  }

  applyOpenGoalLeaderModal(goals: FormArray, index: number): void {
    this.activeGoalIndex.set(index);

    const currentLeader = goals.at(index)?.get("responsible")?.value;
    this.selectedLeaderId.set(currentLeader || "");

    this.goalLeaderShowModal.set(true);
  }

  applyCloseGoalLeaderModal(): void {
    this.goalLeaderShowModal.set(false);
    this.activeGoalIndex.set(null);
    this.selectedLeaderId.set("");
  }

  applyToggleGoalLeaderModal(goals: FormArray, index?: number): void {
    if (this.goalLeaderShowModal()) {
      this.applyCloseGoalLeaderModal();
    } else if (index !== undefined) {
      this.applyOpenGoalLeaderModal(goals, index);
    }
  }
}
