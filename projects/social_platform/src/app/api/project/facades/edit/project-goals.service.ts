/** @format */

import { inject, Injectable } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";
import { catchError, forkJoin, map, of, Subject, takeUntil, tap } from "rxjs";
import { Goal } from "@domain/project/goals.model";
import { ProjectGoalsUIService } from "./ui/project-goals-ui.service";
import { LoggerService } from "@corelib";
import { GoalFormData } from "@domain/project/goal-form-data.model";
import { CreateGoalsUseCase } from "../../use-cases/create-goals.use-case";
import { UpdateGoalUseCase } from "../../use-cases/update-goal.use-case";
import { DeleteGoalUseCase } from "../../use-cases/delete-goal.use-case";

/** Сервис для управления целями проекта. */
@Injectable({
  providedIn: "root",
})
export class ProjectGoalService {
  private readonly fb = inject(FormBuilder);
  private goalForm!: FormGroup;
  private readonly projectFormService = inject(ProjectFormService);
  private readonly projectGoalsUIService = inject(ProjectGoalsUIService);
  private readonly loggerService = inject(LoggerService);
  private readonly createGoalsUseCase = inject(CreateGoalsUseCase);
  private readonly updateGoalUseCase = inject(UpdateGoalUseCase);
  private readonly deleteGoalUseCase = inject(DeleteGoalUseCase);

  private readonly destroy$ = new Subject<void>();

  private initialized = false;
  private readonly goalItems = this.projectGoalsUIService.goalItems;

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

  public initializeGoalItems(goalFormArray: FormArray): void {
    if (this.initialized) return;

    if (goalFormArray && goalFormArray.length > 0) {
      this.goalItems.set(goalFormArray.value);
    }
    this.initialized = true;
  }

  public syncGoalItems(goalFormArray: FormArray): void {
    if (goalFormArray) {
      this.goalItems.set(goalFormArray.value);
    }
  }

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

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getForm(): FormGroup {
    return this.goalForm;
  }

  public get goals(): FormArray {
    return this.goalForm.get("goals") as FormArray;
  }

  public get goalName(): FormControl {
    return this.goalForm.get("title") as FormControl;
  }

  public get goalDate(): FormControl {
    return this.goalForm.get("completionDate") as FormControl;
  }

  public get goalLeader(): FormControl {
    return this.goalForm.get("responsible") as FormControl;
  }

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

  public removeGoal(index: number, goalId: number, projectId: number): void {
    const goalFormArray = this.goals;

    this.goalItems.update(items => items.filter((_, i) => i !== index));
    goalFormArray.removeAt(index);

    this.deleteGoalUseCase
      .execute(projectId, goalId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          this.loggerService.error("Error deleting goal:", result.error.cause);
        }
      });
  }

  public getSelectedLeaderForGoal(goalIndex: number, collaborators: any[]) {
    const goalFormGroup = this.goals.at(goalIndex);
    const leaderId = goalFormGroup?.get("responsible")?.value;

    if (!leaderId) return null;

    return collaborators.find(collab => collab.userId.toString() === leaderId.toString());
  }

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

  public saveGoals(projectId: number, newGoals: Goal[]) {
    const goalIndexes = this.goals.controls
      .map((_, idx) => idx)
      .filter(idx => !this.goals.at(idx)?.get("id")?.value);

    const payload: GoalFormData[] = newGoals.map(goal => ({
      id: goal.id ?? null,
      title: goal.title,
      completionDate: goal.completionDate,
      responsible: goal.responsible,
      isDone: goal.isDone,
    }));

    return this.createGoalsUseCase.execute(projectId, payload).pipe(
      tap(result => {
        if (!result.ok) {
          this.loggerService.error("Error saving goals:", result.error.cause);
          return;
        }

        result.value.forEach((createdGoal: Goal, idx: number) => {
          const formGroup = this.goals.at(goalIndexes[idx]);
          if (formGroup && createdGoal?.id != null) {
            formGroup.patchValue({ id: createdGoal.id });
          }
        });
      }),
      map(result =>
        result.ok ? result.value : { __error: true, err: result.error.cause, original: newGoals }
      ),
      catchError(err => of({ __error: true, err, original: newGoals }))
    );
  }

  public editGoals(projectId: number, existingGoals: Goal[]) {
    const requests = existingGoals.map((item, idx) => {
      const payload: GoalFormData = {
        id: item.id,
        title: item.title,
        completionDate: item.completionDate,
        responsible: item.responsible,
        isDone: item.isDone,
      };

      return this.updateGoalUseCase.execute(projectId, item.id, payload).pipe(
        map(result =>
          result.ok
            ? { res: result.value, idx }
            : { __error: true, err: result.error.cause, original: item, idx }
        ),
        catchError(err => of({ __error: true, err, original: item, idx }))
      );
    });

    return forkJoin(requests);
  }

  public reset(): void {
    this.goalItems.set([]);
    this.initialized = false;
    this.projectGoalsUIService.applyCloseGoalLeaderModal();
  }

  public clearGoalsFormArray(): void {
    const goalFormArray = this.goals;

    while (goalFormArray.length !== 0) {
      goalFormArray.removeAt(0);
    }

    this.goalItems.set([]);
  }
}
