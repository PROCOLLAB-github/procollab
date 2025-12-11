/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { catchError, forkJoin, map, Observable, of, tap } from "rxjs";
import { Partner, PartnerDto } from "../../domain/project/partner.model";

@Injectable({
  providedIn: "root",
})
export class ProjectPartnerService {
  private readonly fb = inject(FormBuilder);
  private partnerForm!: FormGroup;
  private readonly projectService = inject(ProjectService);
  public readonly partnerItems = signal<any[]>([]);

  /** Флаг инициализации сервиса */
  private initialized = false;

  constructor() {
    this.initializePartnerForm();
  }

  private initializePartnerForm(): void {
    this.partnerForm = this.fb.group({
      partners: this.fb.array([]),
      name: [null],
      inn: [null, [Validators.minLength(10), Validators.maxLength(10)]],
      contribution: [null, Validators.maxLength(200)],
      decisionMaker: [null],
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
  public initializePartnerFromProject(partners: Partner[]): void {
    const partnerFormArray = this.partners;

    while (partnerFormArray.length !== 0) {
      partnerFormArray.removeAt(0);
    }

    if (partners && Array.isArray(partners)) {
      partners.forEach(partner => {
        const partnerGroup = this.fb.group({
          id: [partner.id],
          name: [partner.company.name, Validators.required],
          inn: [partner.company.inn, Validators.required],
          contribution: [partner.contribution, Validators.required],
          company: [partner.company],
          decisionMaker: [
            "https://app.procollab.ru/office/profile/" + partner.decisionMaker,
            Validators.required,
          ],
        });
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
    return this.partnerForm.get("name") as FormControl;
  }

  public get partnerINN(): FormControl {
    return this.partnerForm.get("inn") as FormControl;
  }

  public get partnerMention(): FormControl {
    return this.partnerForm.get("contribution") as FormControl;
  }

  public get partnerProfileLink(): FormControl {
    return this.partnerForm.get("decisionMaker") as FormControl;
  }

  /**
   * Добавляет нового партнера или сохраняет изменения существующей.
   * @param name - название партнера (опционально)
   * @param inn - инн (опционально)
   * @param contribution - вклад партнера (опционально)
   * @param decisionMaker - ссылка на профиль представителя компании (опционально)
   */
  public addPartner(
    name?: string,
    inn?: string,
    contribution?: string,
    decisionMaker?: string
  ): void {
    const partnerFormArray = this.partners;

    this.initializePartnerItems(partnerFormArray);

    const partnerName = name || this.partnerForm.get("name")?.value;
    const INN = inn || this.partnerForm.get("inn")?.value;
    const mention = contribution || this.partnerForm.get("contribution")?.value;
    const profileLink = decisionMaker || this.partnerForm.get("decisionMaker")?.value;

    if (
      !partnerName ||
      !INN ||
      !mention ||
      !profileLink ||
      partnerName.trim().length === 0 ||
      mention.trim().length === 0 ||
      INN.trim().length === 0 ||
      profileLink.trim().length === 0
    ) {
      return;
    }

    const partnerItem = this.fb.group({
      id: [null],
      name: [partnerName.trim(), Validators.required],
      inn: [INN.trim(), Validators.required],
      contribution: [mention, Validators.required],
      decisionMaker: [profileLink, Validators.required],
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

  /**
   * Получает данные всех партнеров для отправки на сервер
   * @returns массив объектов партнеров
   */
  public getPartnersData(): any[] {
    return this.partners.value.map((partner: any) => ({
      id: partner.id ?? null,
      name: partner.name,
      inn: partner.inn,
      contribution: partner.contribution,
      decisionMaker: partner.decisionMaker,
    }));
  }

  /**
   * Сохраняет только новых партнеров (у которых id === null) — отправляет POST.
   * После ответов присваивает полученные id в соответствующие FormGroup.
   * Возвращает Observable массива результатов (в порядке отправки).
   */
  public savePartners(projectId: number) {
    const partners = this.getPartnersData();

    if (partners.length === 0) {
      return of([]);
    }

    const requests = partners.map(partner => {
      const decisionMaker = Number(partner.decisionMaker.split("/").at(-1));

      const payload: PartnerDto = {
        name: partner.name,
        inn: partner.inn,
        contribution: partner.contribution,
        decisionMaker,
      };

      return this.projectService.addPartner(projectId, payload).pipe(
        map((res: any) => ({ res, idx: partner.id })),
        catchError(err => of({ __error: true, err, original: partner }))
      );
    });

    return forkJoin(requests).pipe(
      tap(results => {
        results.forEach((r: any) => {
          if (r && r.__error) {
            console.error("Failed to post partner", r.err, "original:", r.original);
            return;
          }

          const created = r.res;
          const idx = r.idx;

          if (created && created.id !== undefined && created.id !== null) {
            const formGroup = this.partners.at(idx);
            if (formGroup) {
              formGroup.get("id")?.setValue(created.id);
            }
          } else {
            console.warn("addPartner response has no id field:", r.res);
          }
        });

        this.syncPartnerItems(this.partners);
      })
    );
  }
}
