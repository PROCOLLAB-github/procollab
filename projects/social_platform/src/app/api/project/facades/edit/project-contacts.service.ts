/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";

/** Сервис для управления контактами проекта. */
@Injectable({
  providedIn: "root",
})
export class ProjectContactsService {
  private readonly fb = inject(FormBuilder);
  private readonly projectFormService = inject(ProjectFormService);
  public readonly linksItems = signal<any[]>([]);
  private initialized = false;

  private initializeLinksItems(linksFormArray: FormArray): void {
    if (this.initialized) return;

    if (linksFormArray && linksFormArray.length > 0) {
      // Синхронизируем сигнал с данными из FormArray
      this.linksItems.set(linksFormArray.value);
    }
    this.initialized = true;
  }

  public syncLinksItems(linksFormArray: FormArray): void {
    if (linksFormArray && linksFormArray.length > 0) {
      this.linksItems.set(linksFormArray.value);
    } else {
      this.linksItems.set([]);
    }
    this.initialized = true;
  }

  readonly hasLinks = computed(() => this.linksItems().length > 0);

  private get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  public get links(): FormArray {
    return this.projectForm.get("links") as FormArray;
  }

  public get link(): FormControl {
    return this.projectForm.get("link") as FormControl;
  }

  public addLink(linksFormArray: FormArray): void {
    this.initializeLinksItems(linksFormArray);
    linksFormArray.push(this.fb.control("", Validators.required));
    this.syncLinksItems(linksFormArray);
  }

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

  public removeLink(index: number, linksFormArray: FormArray): void {
    // Удаляем из сигнала и из FormArray
    linksFormArray.removeAt(index);
    this.syncLinksItems(linksFormArray);
  }

  public clearAllLinksErrors(links: FormArray): void {
    links.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          control.get(key)?.setErrors(null);
        });
      }
    });
  }

  public reset(): void {
    this.linksItems.set([]);
    this.initialized = false;
  }
}
