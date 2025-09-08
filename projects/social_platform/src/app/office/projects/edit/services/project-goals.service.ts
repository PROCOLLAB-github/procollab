/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";

/**
 * Сервис для управления целями проекта и выбором лидера(ответсвенного за цель) и даты цели
 * Предоставляет методы для добавления, даления целей,
 * а также очистки ошибок валидации.
 */
@Injectable({
  providedIn: "root",
})
export class ProjectGoalService {
  /** FormBuilder для создания FormGroup элементов */
  private readonly fb = inject(FormBuilder);

  /** Сервис для управления индексом редактируемого достижения */
  private readonly projectFormService = inject(ProjectFormService);

  /** Сигнал для хранения списка целей (массив объектов) */
  public readonly goalItems = signal<any[]>([]);
  private initialized = false;

  /**
   * Инициализирует сигнал goalItems из данных FormArray
   * Вызывается при первом обращении к данным
   */
  private initializeGoalItems(goalFormArray: FormArray): void {
    if (this.initialized) return;

    if (goalFormArray && goalFormArray.length > 0) {
      this.goalItems.set(goalFormArray.value);
    }
    this.initialized = true;
  }

  /**
   * Принудительно синхронизирует сигнал с FormArray
   * Полезно вызывать после загрузки данных с сервера
   */
  public syncGoalItems(goalFormArray: FormArray): void {
    if (goalFormArray) {
      this.goalItems.set(goalFormArray.value);
    }
  }

  /**
   * Получает основную форму проекта
   */
  private get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  /**
   * Получает FormArray целей
   */
  public get goals(): FormArray {
    return this.projectForm.get("goals") as FormArray;
  }

  /**
   * Получает FormControl для поля ввода названия цели
   */
  public get goalName(): FormControl {
    return this.projectForm.get("goalName") as FormControl;
  }

  /**
   * Получает FormControl для поля ввода даты цели
   */
  public get goalDate(): FormControl {
    return this.projectForm.get("goalDate") as FormControl;
  }

  /**
   * Получает FormControl для поля лидера(исполнителя/ответсвенного) цели
   */
  public get goalLeader(): FormControl {
    return this.projectForm.get("goalLeader") as FormControl;
  }

  /**
   * Добавляет новую цель или сохраняет изменения существующего.
   * @param goalFormArray FormArray, содержащий формы достижений
   * @param projectForm основная форма проекта (FormGroup)
   */
  public addGoal(goalFormArray: FormArray, projectForm: FormGroup): void {
    this.initializeGoalItems(goalFormArray);

    const goalName = projectForm.get("goalName")?.value;
    const goalDate = projectForm.get("goalDate")?.value;
    const goalLeader = projectForm.get("goalLeader")?.value;

    if (!goalName || !goalDate || goalName.trim().length === 0 || goalDate.trim().length === 0) {
      return;
    }

    const goalItems = this.fb.group({
      title: goalName.trim(),
      completionDate: goalDate.trim(),
      responsibleInfo: goalLeader,
      isDone: false,
    });

    const editIdx = this.projectFormService.editIndex();
    if (editIdx !== null) {
      this.goalItems.update(items => {
        const updated = [...items];
        updated[editIdx] = goalItems.value;
        return updated;
      });
      goalFormArray.at(editIdx).patchValue(goalItems.value);
      this.projectFormService.editIndex.set(null);
    } else {
      this.goalItems.update(items => [...items, goalItems.value]);
      goalFormArray.push(goalItems);
    }

    // Очищаем поля ввода формы проекта
    projectForm.get("goalName")?.reset();
    projectForm.get("goalName")?.setValue("");

    projectForm.get("goalDate")?.reset();
    projectForm.get("goalDate")?.setValue("");

    projectForm.get("goalLeader")?.reset();
    projectForm.get("goalLeader")?.setValue("");
  }

  /**
   * Удаляет цель по указанному индексу.
   * @param index индекс удаляемого достижения
   * @param goalFormArray FormArray достижений
   */
  public removeGoal(index: number, goalFormArray: FormArray): void {
    this.goalItems.update(items => items.filter((_, i) => i !== index));
    goalFormArray.removeAt(index);
  }

  /**
   * Сбрасывает все ошибки валидации во всех контролах FormArray цели.
   * @param goals FormArray достижений
   */
  public clearAllGoalsErrors(goals: FormArray): void {
    goals.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          control.get(key)?.setErrors(null);
        });
      }
    });
  }

  /**
   * Сбрасывает состояние сервиса
   * Полезно при смене проекта или очистке формы
   */
  public reset(): void {
    this.goalItems.set([]);
    this.initialized = false;
  }
}
