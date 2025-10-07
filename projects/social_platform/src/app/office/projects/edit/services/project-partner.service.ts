/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class ProjectPartnerService {
  private readonly fb = inject(FormBuilder);
  private partnerForm!: FormGroup;
  public readonly partnerItems = signal<any[]>([]);

  /** Флаг инициализации сервиса */
  private initialized = false;

  constructor() {
    this.initializePartnerForm();
  }

  private initializePartnerForm(): void {
    this.partnerForm = this.fb.group({
      partners: this.fb.array([]),
      partnerName: [null],
      partnerINN: [null],
      partnerMention: [null, Validators.maxLength(200)],
      partnerProfileLink: [null],
    });
  }

  /**
   * Инициализирует сигнал partnerItems из данных FormArray
   * Вызывается при первом обращении к данным
   */
  public initializePartnerItems(partnerFormArray: FormArray): void {
    if (this.initialized) return;

    if (partnerFormArray && this.partnerItems.length > 0) {
      this.partnerItems.set(partnerFormArray.value);
    }

    this.initialized = true;
  }

  /**
   * Принудительно синхронизирует сигнал с FormArray
   * Полезно вызывать после загрузки данных с сервера
   */
  public syncPartnerItems(partnerFormArray: FormArray): void {
    if (partnerFormArray) {
      this.partnerItems.set(partnerFormArray.value);
    }
  }

  /**
   * Инициализирует партнера из данных проекта
   * Заполняет FormArray целей данными из проекта
   */
  public initializePartnerFromProject(partners: any[]): void {
    const partnerFormArray = this.partners;

    while (partnerFormArray.length !== 0) {
      partnerFormArray.removeAt(0);
    }

    if (partners && Array.isArray(partners)) {
      partners.forEach(partner => {
        const partnerGroup = this.fb.group({});
        partnerFormArray.push(partnerGroup);
      });

      this.syncPartnerItems(partnerFormArray);
    } else {
      this.partnerItems.set([]);
    }
  }

  /**
   * Возвращает форму партнеров и ресурсов.
   * @returns FormGroup экземпляр формы целей
   */
  public getForm(): FormGroup {
    return this.partnerForm;
  }

  /**
   * Получает FormArray партнеров и ресурсов
   */
  public get partners(): FormArray {
    return this.partnerForm.get("partners") as FormArray;
  }

  public get partnerName(): FormControl {
    return this.partnerForm.get("partnerName") as FormControl;
  }

  public get partnerINN(): FormControl {
    return this.partnerForm.get("partnerINN") as FormControl;
  }

  public get partnerMention(): FormControl {
    return this.partnerForm.get("partnerMention") as FormControl;
  }

  public get partnerProfileLink(): FormControl {
    return this.partnerForm.get("partnerProfileLink") as FormControl;
  }

  /**
   * Добавляет нового партнера или сохраняет изменения существующей.
   * @param partnerName - название партнера (опционально)
   * @param partnerINN - инн (опционально)
   * @param partnerMention - вклад партнера (опционально)
   * @param partnerProfileLink - ссылка на профиль представителя компании (опционально)
   */
  public addPartner(
    partnerName?: string,
    partnerINN?: string,
    partnerMention?: string,
    partnerProfileLink?: string
  ): void {
    const partnerFormArray = this.partners;

    this.initializePartnerItems(partnerFormArray);

    const name = partnerName || this.partnerForm.get("partnerName")?.value;
    const INN = partnerINN || this.partnerForm.get("partnerINN")?.value;
    const mention = partnerMention || this.partnerForm.get("partnerMention")?.value;
    const profileLink = partnerProfileLink || this.partnerForm.get("partnerProfileLink")?.value;

    if (
      !name ||
      !INN ||
      !mention ||
      !profileLink ||
      name.trim().length === 0 ||
      mention.trim().length === 0 ||
      INN.trim().length === 0 ||
      profileLink.trim().length === 0
    ) {
      return;
    }

    const partnerItem = this.fb.group({
      partnerName: [name.trim(), Validators.required],
      partnerINN: [INN.trim(), Validators.required],
      partnerMention: [mention, Validators.required],
      partnerProfileLink: [profileLink, Validators.required],
    });

    this.partnerItems.update(items => [...items, partnerItem.value]);
    partnerFormArray.push(partnerItem);
  }

  /**
   * Удаляет партнера по указанному индексу.
   * @param index индекс удаляемого партнера
   */
  public removePartner(index: number): void {
    const partnerFormArray = this.partners;

    this.partnerItems.update(items => items.filter((_, i) => i !== index));
    partnerFormArray.removeAt(index);
  }

  /**
   * Сбрасывает все ошибки валидации во всех контролах FormArray партнера.
   */
  public clearAllPartnerErrors(): void {
    const partners = this.partners;

    partners.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          control.get(key)?.setErrors(null);
        });
      }
    });
  }
}
