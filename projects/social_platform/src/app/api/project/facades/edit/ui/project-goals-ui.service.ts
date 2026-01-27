/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { FormArray } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class ProjectGoalsUIService {
  readonly goalLeaderShowModal = signal<boolean>(false);
  readonly activeGoalIndex = signal<number | null>(null);
  readonly selectedLeaderId = signal<string>("");

  readonly goalItems = signal<any[]>([]);

  readonly hasGoals = computed(() => this.goalItems().length > 0);

  /**
   * Обработчик изменения радио-кнопки для выбора лидера
   * @param event - событие изменения
   */
  applyOnLeaderRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedLeaderId.set(target.value);
  }

  /**
   * Добавляет лидера на определенную цель
   */
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

  /**
   * Открывает модальное окно выбора лидера для конкретной цели
   * @param index - индекс цели
   */
  applyOpenGoalLeaderModal(goals: FormArray, index: number): void {
    this.activeGoalIndex.set(index);

    const currentLeader = goals.at(index)?.get("responsible")?.value;
    this.selectedLeaderId.set(currentLeader || "");

    this.goalLeaderShowModal.set(true);
  }

  /**
   * Закрывает модальное окно выбора лидера
   */
  applyCloseGoalLeaderModal(): void {
    this.goalLeaderShowModal.set(false);
    this.activeGoalIndex.set(null);
    this.selectedLeaderId.set("");
  }

  /**
   * Переключает состояние модального окна выбора лидера
   * @param index - индекс цели (опционально)
   */
  applyToggleGoalLeaderModal(goals: FormArray, index?: number): void {
    if (this.goalLeaderShowModal()) {
      this.applyCloseGoalLeaderModal();
    } else if (index !== undefined) {
      this.applyOpenGoalLeaderModal(goals, index);
    }
  }
}
