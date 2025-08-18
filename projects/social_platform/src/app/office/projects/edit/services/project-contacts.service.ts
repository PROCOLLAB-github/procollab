/** @format */

import { inject, Injectable, signal, effect } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { ProjectFormService } from "./project-form.service";

@Injectable({
  providedIn: "root",
})
export class ProjectContactsService {
  private readonly fb = inject(FormBuilder);
  private readonly projectFormService = inject(ProjectFormService);
  public readonly linksItems = signal<any[]>([]);

  constructor() {
    effect(() => {
      const formArray = this.links;
      if (formArray && formArray.length > 0) {
        const currentSignalValue = this.linksItems();
        const formArrayValue = formArray.value;

        if (JSON.stringify(currentSignalValue) !== JSON.stringify(formArrayValue)) {
          this.linksItems.set(formArrayValue);
        }
      }
    });
  }

  private get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  public get links(): FormArray {
    return this.projectForm.get("links") as FormArray;
  }

  public get link(): FormControl {
    return this.projectForm.get("link") as FormControl;
  }

  /**
   * Принудительная синхронизация сигнала с FormArray
   * Вызывается после загрузки данных проекта
   */
  public syncLinksItems(): void {
    const linksFormArray = this.links;
    if (linksFormArray && linksFormArray.length > 0) {
      this.linksItems.set(linksFormArray.value);
    } else {
      this.linksItems.set([]);
    }
  }

  public addLink(): void {
    const linkValue = this.link?.value;

    if (
      !linkValue ||
      !linkValue.trim() ||
      !linkValue.includes("https://") ||
      !linkValue.includes("http://")
    ) {
      return;
    }

    const trimmedLink = linkValue.trim();
    const editIdx = this.projectFormService.editIndex();

    if (editIdx !== null) {
      // Режим редактирования
      this.links.at(editIdx).setValue(trimmedLink);
      this.linksItems.update(items => {
        const updated = [...items];
        updated[editIdx] = trimmedLink;
        return updated;
      });
      this.projectFormService.editIndex.set(null);
    } else {
      // Добавление нового элемента
      this.links.push(this.fb.control(trimmedLink));
      this.linksItems.update(items => [...items, trimmedLink]);
    }

    // Очищаем поле ввода
    this.link?.reset();
    this.link?.setValue("");
  }

  public editLink(index: number): void {
    const value = this.links.value[index];
    this.projectForm.patchValue({ link: value });
    this.projectFormService.editIndex.set(index);
  }

  public removeLink(index: number): void {
    this.links.removeAt(index);
    this.linksItems.update(items => items.filter((_, i) => i !== index));
  }

  public reset(): void {
    this.linksItems.set([]);
  }
}
