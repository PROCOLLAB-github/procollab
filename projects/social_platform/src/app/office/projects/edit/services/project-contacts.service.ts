/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";

/**
 * Сервис для управления контактами проекта.
 * Предоставляет методы для добавления, редактирования, удаления ссылок,
 * а также очистки ошибок валидации.
 */
@Injectable({
  providedIn: "root",
})
export class ProjectContactsService {
  /** FormBuilder для создания FormGroup элементов */
  private readonly fb = inject(FormBuilder);
  /** Сервис для управления индексом редактируемой ссылки */
  private readonly projectFormService = inject(ProjectFormService);
  /** Сигнал для хранения списка ссылок (массив объектов) */
  public readonly linksItems = signal<any[]>([]);
  private initialized = false;

  /**
   * Инициализирует сигнал linksItems из данных FormArray
   * Вызывается при первом обращении к данным
   */
  private initializeLinksItems(linksFormArray: FormArray): void {
    if (this.initialized) return;

    if (linksFormArray && linksFormArray.length > 0) {
      // Синхронизируем сигнал с данными из FormArray
      this.linksItems.set(linksFormArray.value);
    }
    this.initialized = true;
  }

  /**
   * Принудительно синхронизирует сигнал с FormArray
   * Полезно вызывать после загрузки данных с сервера
   */
  public syncLinksItems(linksFormArray: FormArray): void {
    if (linksFormArray) {
      this.linksItems.set(linksFormArray.value);
    }
  }

  /**
   * Получает основную форму проекта
   */
  private get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  /**
   * Получает FormArray ссылок
   */
  public get links(): FormArray {
    return this.projectForm.get("links") as FormArray;
  }

  /**
   * Получает FormControl для поля ввода ссылки
   */
  public get link(): FormControl {
    return this.projectForm.get("link") as FormControl;
  }

  /**
   * Добавляет новую ссылку или сохраняет изменения существующей.
   * @param linksFormArray FormArray, содержащий формы ссылок
   * @param projectForm основная форма проекта (FormGroup)
   */
  public addLink(linksFormArray: FormArray, projectForm: FormGroup): void {
    // Инициализируем сигнал при первом вызове
    this.initializeLinksItems(linksFormArray);

    // Считываем вводимые данные
    const linkValue = projectForm.get("link")?.value;

    // Проверяем, что поле не пустое и содержит валидный URL
    if (
      !linkValue ||
      !linkValue.trim() ||
      (!linkValue.includes("https://") && !linkValue.includes("http://"))
    ) {
      return; // Выходим из функции, если поле пустое или невалидное
    }

    const trimmedLink = linkValue.trim();

    // Проверяем, редактируется ли существующая ссылка
    const editIdx = this.projectFormService.editIndex();
    if (editIdx !== null) {
      // Обновляем массив сигналов и соответствующий контрол в FormArray
      this.linksItems.update(items => {
        const updated = [...items];
        updated[editIdx] = trimmedLink.value;
        return updated;
      });
      linksFormArray.at(editIdx).patchValue(trimmedLink.value);
      // Сбрасываем индекс редактирования
      this.projectFormService.editIndex.set(null);
    } else {
      // Добавляем новую ссылку в сигнал и FormArray
      this.linksItems.update(items => [...items, trimmedLink.value]);
      linksFormArray.push(this.fb.control(trimmedLink, Validators.required));
    }

    // Очищаем поле ввода формы проекта
    projectForm.get("link")?.reset();
    projectForm.get("link")?.setValue("");
  }

  /**
   * Инициализирует редактирование существующей ссылки.
   * @param index индекс ссылки в списке
   * @param linksFormArray FormArray ссылок
   * @param projectForm основная форма проекта
   */
  public editLink(index: number, linksFormArray: FormArray, projectForm: FormGroup): void {
    // Инициализируем сигнал при необходимости
    this.initializeLinksItems(linksFormArray);

    // Используем данные из FormArray как источник истины
    const source = linksFormArray.value[index];

    // Заполняем поле формы проекта для редактирования
    projectForm.patchValue({
      link: source?.link || "",
    });
    // Устанавливаем текущий индекс редактирования в сервисе
    this.projectFormService.editIndex.set(index);
  }

  /**
   * Удаляет ссылку по указанному индексу.
   * @param index индекс удаляемой ссылки
   * @param linksFormArray FormArray ссылок
   */
  public removeLink(index: number, linksFormArray: FormArray): void {
    // Удаляем из сигнала и из FormArray
    this.linksItems.update(items => items.filter((_, i) => i !== index));
    linksFormArray.removeAt(index);
  }

  /**
   * Сбрасывает все ошибки валидации во всех контролах FormArray ссылок.
   * @param links FormArray ссылок
   */
  public clearAllLinksErrors(links: FormArray): void {
    links.controls.forEach(control => {
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
    this.linksItems.set([]);
    this.initialized = false;
  }
}
