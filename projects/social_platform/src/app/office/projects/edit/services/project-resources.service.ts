/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class ProjectResourceService {
  private readonly fb = inject(FormBuilder);
  private resourceForm!: FormGroup;
  public readonly resourceItems = signal<any[]>([]);

  /** Флаг инициализации сервиса */
  private initialized = false;

  constructor() {
    this.initializeResourceForm();
  }

  private initializeResourceForm(): void {
    this.resourceForm = this.fb.group({
      resources: this.fb.array([]),
      resoruceType: [null],
      resoruceDescription: [null, Validators.maxLength(200)],
      resourcePartner: [null],
    });
  }

  /**
   * Инициализирует сигнал resourceItems из данных FormArray
   * Вызывается при первом обращении к данным
   */
  public initializePartnerItems(resourceFormArray: FormArray): void {
    if (this.initialized) return;

    if (resourceFormArray && this.resourceItems.length > 0) {
      this.resourceItems.set(resourceFormArray.value);
    }

    this.initialized = true;
  }

  /**
   * Принудительно синхронизирует сигнал с FormArray
   * Полезно вызывать после загрузки данных с сервера
   */
  public syncResourceItems(resourceFormArray: FormArray): void {
    if (resourceFormArray) {
      this.resourceItems.set(resourceFormArray.value);
    }
  }

  /**
   * Инициализирует ресурсы из данных проекта
   * Заполняет FormArray целей данными из проекта
   */
  public initializeResourcesFromProject(resources: any[]): void {
    const resourcesFormArray = this.resources;

    while (resourcesFormArray.length !== 0) {
      resourcesFormArray.removeAt(0);
    }

    if (resources && Array.isArray(resources)) {
      resources.forEach(resource => {
        const partnerGroup = this.fb.group({});
        resourcesFormArray.push(partnerGroup);
      });

      this.syncResourceItems(resourcesFormArray);
    } else {
      this.resourceItems.set([]);
    }
  }

  /**
   * Возвращает форму партнеров и ресурсов.
   * @returns FormGroup экземпляр формы целей
   */
  public getForm(): FormGroup {
    return this.resourceForm;
  }

  /**
   * Получает FormArray партнеров и ресурсов
   */
  public get resources(): FormArray {
    return this.resourceForm.get("resources") as FormArray;
  }

  public get resoruceType(): FormControl {
    return this.resourceForm.get("resoruceType") as FormControl;
  }

  public get resoruceDescription(): FormControl {
    return this.resourceForm.get("resoruceDescription") as FormControl;
  }

  public get resourcePartner(): FormControl {
    return this.resourceForm.get("resourcePartner") as FormControl;
  }

  /**
   * Добавляет нового ресурса или сохраняет изменения существующей.
   * @param resoruceType - тип ресурса (опционально)
   * @param resoruceDescription - описание ресурса (опционально)
   * @param resourcePartner - ссылка на партнера (опционально)
   */
  public addPResource(
    resoruceType?: string,
    resoruceDescription?: string,
    resourcePartner?: string
  ): void {
    const resourcesFormArray = this.resources;

    this.initializePartnerItems(resourcesFormArray);

    const type = resoruceType || this.resourceForm.get("resoruceType")?.value;
    const description = resoruceDescription || this.resourceForm.get("resoruceDescription")?.value;
    const partner = resourcePartner || this.resourceForm.get("resourcePartner")?.value;

    if (
      !type ||
      !description ||
      !partner ||
      type.trim().length === 0 ||
      description.trim().length === 0 ||
      partner.trim().length === 0
    ) {
      return;
    }

    const resourceItem = this.fb.group({
      resoruceType: [type.trim(), Validators.required],
      resoruceDescription: [description.trim(), Validators.required],
      resourcePartner: [partner, Validators.required],
    });

    this.resourceItems.update(items => [...items, resourceItem.value]);
    resourcesFormArray.push(resourceItem);
  }

  /**
   * Удаляет ресурс по указанному индексу.
   * @param index индекс удаляемого партнера
   */
  public removeResource(index: number): void {
    const resourceFormArray = this.resources;

    this.resourceItems.update(items => items.filter((_, i) => i !== index));
    resourceFormArray.removeAt(index);
  }

  /**
   * Сбрасывает все ошибки валидации во всех контролах FormArray ресурса.
   */
  public clearAllResourceErrors(): void {
    const resources = this.resources;

    resources.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          control.get(key)?.setErrors(null);
        });
      }
    });
  }
}
