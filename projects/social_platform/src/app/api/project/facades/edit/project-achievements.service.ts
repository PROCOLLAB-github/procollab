/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";

/** Сервис для управления достижениями проекта. */
@Injectable({
  providedIn: "root",
})
export class ProjectAchievementsService {
  private readonly fb = inject(FormBuilder);
  private readonly projectFormService = inject(ProjectFormService);
  public readonly achievementsItems = signal<any[]>([]);
  private initialized = false;

  private initializeAchievementsItems(achievementsFormArray: FormArray): void {
    if (this.initialized) return;

    if (achievementsFormArray && achievementsFormArray.length > 0) {
      // Синхронизируем сигнал с данными из FormArray
      this.achievementsItems.set(achievementsFormArray.value);
    }
    this.initialized = true;
  }

  public syncAchievementsItems(achievementsFormArray: FormArray): void {
    if (achievementsFormArray) {
      this.achievementsItems.set(achievementsFormArray.value);
    }
  }

  private readonly achievements = this.projectFormService.achievements;

  readonly hasAchievements = computed(
    () => this.achievementsItems().length > 0 || this.achievements.length > 0
  );

  private readonly projectForm = this.projectFormService.getForm();

  public addAchievement(achievementsFormArray: FormArray): void {
    // Инициализируем сигнал при первом вызове
    this.initializeAchievementsItems(achievementsFormArray);

    // Считываем вводимые данные
    const title = this.projectForm.get("title")?.value;
    const status = this.projectForm.get("status")?.value;

    // Проверяем, что поля не пустые
    if (!title || !status || title.trim().length === 0 || status.trim().length === 0) {
      return; // Выходим из функции, если поля пустые
    }

    // Создаем FormGroup для нового достижения
    const achievementItem = this.fb.group({
      id: achievementsFormArray.length,
      title: title.trim(),
      status: status.trim(),
    });

    // Проверяем, редактируется ли существующее достижение
    const editIdx = this.projectFormService.editIndex();
    if (editIdx !== null) {
      // Обновляем массив сигналов и соответствующий контрол в FormArray
      this.achievementsItems.update(items => {
        const updated = [...items];
        updated[editIdx] = achievementItem.value;
        return updated;
      });
      achievementsFormArray.at(editIdx).patchValue(achievementItem.value);
      // Сбрасываем индекс редактирования
      this.projectFormService.editIndex.set(null);
    } else {
      // Добавляем новое достижение в сигнал и FormArray
      this.achievementsItems.update(items => [...items, achievementItem.value]);
      achievementsFormArray.push(achievementItem);
    }

    // Очищаем поля ввода формы проекта
    this.projectForm.get("title")?.reset();
    this.projectForm.get("title")?.setValue("");

    this.projectForm.get("status")?.reset();
    this.projectForm.get("status")?.setValue("");
  }

  public editAchievement(index: number, achievementsFormArray: FormArray): void {
    // Инициализируем сигнал при необходимости
    this.initializeAchievementsItems(achievementsFormArray);

    // Используем данные из FormArray как источник истины
    const source = achievementsFormArray.value[index];

    // Заполняем поля формы проекта для редактирования
    this.projectForm.patchValue({
      achievementsName: source?.achievementsName || "",
      achievementsDate: source?.achievementsDate || "",
    });
    // Устанавливаем текущий индекс редактирования в сервисе
    this.projectFormService.editIndex.set(index);
  }

  public removeAchievement(index: number, achievementsFormArray: FormArray): void {
    // Удаляем из сигнала и из FormArray
    this.achievementsItems.update(items => items.filter((_, i) => i !== index));
    achievementsFormArray.removeAt(index);
  }

  public clearAllAchievementsErrors(achievements: FormArray): void {
    achievements.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          control.get(key)?.setErrors(null);
        });
      }
    });
  }

  public reset(): void {
    this.achievementsItems.set([]);
    this.initialized = false;
  }
}
