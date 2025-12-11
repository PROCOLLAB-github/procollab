/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";
import { catchError, forkJoin, map, of, tap } from "rxjs";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { Goal, GoalDto } from "../../domain/project/goals.model";

/**
 * Сервис для управления целями проекта
 * Предоставляет полный набор методов для работы с целями:
 * - инициализация, добавление, редактирование, удаление
 * - валидация и очистка ошибок
 * - управление состоянием модального окна выбора лидера
 */
@Injectable({
  providedIn: "root",
})
export class ProjectGoalService {
  private readonly fb = inject(FormBuilder);
  private goalForm!: FormGroup;
  private readonly projectFormService = inject(ProjectFormService);
  private readonly projectService = inject(ProjectService);
  public readonly goalItems = signal<any[]>([]);

  /** Флаг инициализации сервиса */
  private initialized = false;

  public readonly goalLeaderShowModal = signal<boolean>(false);
  public readonly activeGoalIndex = signal<number | null>(null);
  public readonly selectedLeaderId = signal<string>("");

  constructor() {
    this.initializeGoalForm();
  }

  private initializeGoalForm(): void {
    this.goalForm = this.fb.group({
      goals: this.fb.array([]),
      title: [null],
      completionDate: [null],
      responsible: [null],
    });
  }

  /**
   * Инициализирует сигнал goalItems из данных FormArray
   * Вызывается при первом обращении к данным
   */
  public initializeGoalItems(goalFormArray: FormArray): void {
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
   * Инициализирует цели из данных проекта
   * Заполняет FormArray целей данными из проекта
   */
  public initializeGoalsFromProject(goals: Goal[]): void {
    const goalsFormArray = this.goals;

    while (goalsFormArray.length !== 0) {
      goalsFormArray.removeAt(0);
    }

    if (goals && Array.isArray(goals)) {
      goals.forEach(goal => {
        const goalsGroup = this.fb.group({
          id: [goal.id ?? null],
          title: [goal.title || "", Validators.required],
          completionDate: [goal.completionDate || "", Validators.required],
          responsible: [goal.responsibleInfo?.id?.toString() || "", Validators.required],
          isDone: [goal.isDone || false],
        });
        goalsFormArray.push(goalsGroup);
      });

      this.syncGoalItems(goalsFormArray);
    } else {
      this.goalItems.set([]);
    }
  }

  /**
   * Возвращает форму целей.
   * @returns FormGroup экземпляр формы целей
   */
  public getForm(): FormGroup {
    return this.goalForm;
  }

  /**
   * Получает FormArray целей
   */
  public get goals(): FormArray {
    return this.goalForm.get("goals") as FormArray;
  }

  /**
   * Получает FormControl для поля ввода названия цели
   */
  public get goalName(): FormControl {
    return this.goalForm.get("title") as FormControl;
  }

  /**
   * Получает FormControl для поля ввода даты цели
   */
  public get goalDate(): FormControl {
    return this.goalForm.get("completionDate") as FormControl;
  }

  /**
   * Получает FormControl для поля лидера(исполнителя/ответственного) цели
   */
  public get goalLeader(): FormControl {
    return this.goalForm.get("responsible") as FormControl;
  }

  /**
   * Добавляет новую цель или сохраняет изменения существующей.
   * @param goalName - название цели (опционально)
   * @param goalDate - дата цели (опционально)
   * @param goalLeader - лидер цели (опционально)
   */
  public addGoal(goalName?: string, goalDate?: string, goalLeader?: string): void {
    const goalFormArray = this.goals;

    this.initializeGoalItems(goalFormArray);

    const name = goalName || this.goalForm.get("title")?.value;
    const date = goalDate || this.goalForm.get("completionDate")?.value;
    const leader = goalLeader || this.goalForm.get("responsible")?.value;

    if (!name || !date || name.trim().length === 0 || date.trim().length === 0) {
      return;
    }

    const goalItem = this.fb.group({
      id: [null],
      title: [name.trim(), Validators.required],
      completionDate: [date.trim(), Validators.required],
      responsible: [leader, Validators.required],
      isDone: [false],
    });

    const editIdx = this.projectFormService.editIndex();
    if (editIdx !== null) {
      goalFormArray.at(editIdx).patchValue(goalItem.value);
      this.projectFormService.editIndex.set(null);
    } else {
      this.goalItems.update(items => [...items, goalItem.value]);
      goalFormArray.push(goalItem);
    }

    this.syncGoalItems(goalFormArray);
  }

  /**
   * Удаляет цель по указанному индексу.
   * @param index индекс удаляемой цели
   */
  public removeGoal(index: number): void {
    const goalFormArray = this.goals;

    this.goalItems.update(items => items.filter((_, i) => i !== index));
    goalFormArray.removeAt(index);
  }

  /**
   * Получает выбранного лидера для конкретной цели
   * @param goalIndex - индекс цели
   * @param collaborators - список коллабораторов
   */
  public getSelectedLeaderForGoal(goalIndex: number, collaborators: any[]) {
    const goalFormGroup = this.goals.at(goalIndex);
    const leaderId = goalFormGroup?.get("responsible")?.value;

    if (!leaderId) return null;

    return collaborators.find(collab => collab.userId.toString() === leaderId.toString());
  }

  /**
   * Обработчик изменения радио-кнопки для выбора лидера
   * @param event - событие изменения
   */
  public onLeaderRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedLeaderId.set(target.value);
  }

  /**
   * Добавляет лидера на определенную цель
   */
  public addLeaderToGoal(): void {
    const goalIndex = this.activeGoalIndex();
    const leaderId = this.selectedLeaderId();

    if (goalIndex === null || !leaderId) {
      return;
    }

    const goalFormGroup = this.goals.at(goalIndex);
    goalFormGroup?.get("responsible")?.setValue(leaderId);

    this.closeGoalLeaderModal();
  }

  /**
   * Открывает модальное окно выбора лидера для конкретной цели
   * @param index - индекс цели
   */
  public openGoalLeaderModal(index: number): void {
    this.activeGoalIndex.set(index);

    const currentLeader = this.goals.at(index)?.get("responsible")?.value;
    this.selectedLeaderId.set(currentLeader || "");

    this.goalLeaderShowModal.set(true);
  }

  /**
   * Закрывает модальное окно выбора лидера
   */
  public closeGoalLeaderModal(): void {
    this.goalLeaderShowModal.set(false);
    this.activeGoalIndex.set(null);
    this.selectedLeaderId.set("");
  }

  /**
   * Переключает состояние модального окна выбора лидера
   * @param index - индекс цели (опционально)
   */
  public toggleGoalLeaderModal(index?: number): void {
    if (this.goalLeaderShowModal()) {
      this.closeGoalLeaderModal();
    } else if (index !== undefined) {
      this.openGoalLeaderModal(index);
    }
  }

  /**
   * Сбрасывает все ошибки валидации во всех контролах FormArray цели.
   */
  public clearAllGoalsErrors(): void {
    const goals = this.goals;

    goals.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          control.get(key)?.setErrors(null);
        });
      }
    });
  }

  /**
   * Получает данные всех целей для отправки на сервер
   * @returns массив объектов целей
   */
  public getGoalsData(): any[] {
    return this.goals.value.map((g: any) => ({
      id: g.id ?? null,
      title: g.title,
      completionDate: g.completionDate,
      responsible:
        g.responsible === null || g.responsible === undefined || g.responsible === ""
          ? null
          : Number(g.responsible),
      isDone: !!g.isDone,
    }));
  }

  /**
   * Сохраняет только новые цели (у которых id === null) — отправляет POST.
   * После ответов присваивает полученные id в соответствующие FormGroup.
   * Возвращает Observable массива результатов (в порядке отправки).
   */
  public saveGoals(projectId: number, newGoals: Goal[]) {
    return this.projectService.addGoals(projectId, newGoals).pipe(
      tap(results => {
        results.forEach((createdGoal: any, idx: number) => {
          const formGroup = this.goals.at(idx);
          if (formGroup && createdGoal?.id != null) {
            formGroup.patchValue({ id: createdGoal.id });
          }
        });
      }),
      catchError(err => {
        console.error("Error saving goals:", err);
        return of({ __error: true, err, original: newGoals });
      })
    );
  }

  public editGoals(projectId: number, existingGoals: Goal[]) {
    const requests = existingGoals.map((item, idx) => {
      const payload: GoalDto = {
        id: item.id,
        title: item.title,
        completionDate: item.completionDate,
        responsible: item.responsible,
        isDone: item.isDone,
      };

      return this.projectService.editGoal(projectId, item.id, payload).pipe(
        map(res => ({ res, idx })),
        catchError(err => of({ __error: true, err, original: item, idx }))
      );
    });

    return forkJoin(requests);
  }

  /**
   * Сбрасывает состояние сервиса
   * Полезно при смене проекта или очистке формы
   */
  public reset(): void {
    this.goalItems.set([]);
    this.initialized = false;
    this.closeGoalLeaderModal();
  }

  /**
   * Очищает FormArray целей
   */
  public clearGoalsFormArray(): void {
    const goalFormArray = this.goals;

    while (goalFormArray.length !== 0) {
      goalFormArray.removeAt(0);
    }

    this.goalItems.set([]);
  }
}
