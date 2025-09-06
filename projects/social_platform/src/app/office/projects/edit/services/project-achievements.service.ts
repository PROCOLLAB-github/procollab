/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";

/**
 * Сервис для управления достижениями проекта.
 * Предоставляет методы для добавления, редактирования, удаления достижений,
 * а также очистки ошибок валидации.
 */
@Injectable({
  providedIn: "root",
})
export class ProjectAchievementsService {
  /** FormBuilder для создания FormGroup элементов */
  private readonly fb = inject(FormBuilder);
  /** Сервис для управления индексом редактируемого достижения */
  private readonly projectFormService = inject(ProjectFormService);
  /** Сигнал для хранения списка достижений (массив объектов) */
  public readonly achievementsItems = signal<any[]>([]);
  private initialized = false;

  /**
   * Инициализирует сигнал achievementsItems из данных FormArray
   * Вызывается при первом обращении к данным
   */
  private initializeAchievementsItems(achievementsFormArray: FormArray): void {
    if (this.initialized) return;

    if (achievementsFormArray && achievementsFormArray.length > 0) {
      // Синхронизируем сигнал с данными из FormArray
      this.achievementsItems.set(achievementsFormArray.value);
    }
    this.initialized = true;
  }

  /**
   * Принудительно синхронизирует сигнал с FormArray
   * Полезно вызывать после загрузки данных с сервера
   */
  public syncAchievementsItems(achievementsFormArray: FormArray): void {
    if (achievementsFormArray) {
      this.achievementsItems.set(achievementsFormArray.value);
    }
  }

  /**
   * Добавляет новое достижение или сохраняет изменения существующего.
   * @param achievementsFormArray FormArray, содержащий формы достижений
   * @param projectForm основная форма проекта (FormGroup)
   */
  public addAchievement(achievementsFormArray: FormArray, projectForm: FormGroup): void {
    // Инициализируем сигнал при первом вызове
    this.initializeAchievementsItems(achievementsFormArray);

    // Считываем вводимые данные
    const achievementsName = projectForm.get("achievementsName")?.value;
    const achievementsDate = projectForm.get("achievementsDate")?.value;

    // Проверяем, что поля не пустые
    if (
      !achievementsName ||
      !achievementsDate ||
      achievementsName.trim().length === 0 ||
      achievementsDate.trim().length === 0
    ) {
      return; // Выходим из функции, если поля пустые
    }

    // Создаем FormGroup для нового достижения
    const achievementItem = this.fb.group({
      id: achievementsFormArray.length,
      achievementsName: achievementsName.trim(),
      achievementsDate: achievementsDate.trim(),
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
    projectForm.get("achievementsName")?.reset();
    projectForm.get("achievementsName")?.setValue("");

    projectForm.get("achievementsDate")?.reset();
    projectForm.get("achievementsDate")?.setValue("");
  }

  /**
   * Инициализирует редактирование существующего достижения.
   * @param index индекс достижения в списке
   * @param achievementsFormArray FormArray достижений
   * @param projectForm основная форма проекта
   */
  public editAchievement(
    index: number,
    achievementsFormArray: FormArray,
    projectForm: FormGroup
  ): void {
    // Инициализируем сигнал при необходимости
    this.initializeAchievementsItems(achievementsFormArray);

    // Используем данные из FormArray как источник истины
    const source = achievementsFormArray.value[index];

    // Заполняем поля формы проекта для редактирования
    projectForm.patchValue({
      achievementsName: source?.achievementsName || "",
      achievementsDate: source?.achievementsDate || "",
    });
    // Устанавливаем текущий индекс редактирования в сервисе
    this.projectFormService.editIndex.set(index);
  }

  /**
   * Удаляет достижение по указанному индексу.
   * @param index индекс удаляемого достижения
   * @param achievementsFormArray FormArray достижений
   */
  public removeAchievement(index: number, achievementsFormArray: FormArray): void {
    // Удаляем из сигнала и из FormArray
    this.achievementsItems.update(items => items.filter((_, i) => i !== index));
    achievementsFormArray.removeAt(index);
  }

  /**
   * Сбрасывает все ошибки валидации во всех контролах FormArray достижений.
   * @param achievements FormArray достижений
   */
  public clearAllAchievementsErrors(achievements: FormArray): void {
    achievements.controls.forEach(control => {
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
    this.achievementsItems.set([]);
    this.initialized = false;
  }
}
