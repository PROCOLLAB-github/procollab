/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { catchError, forkJoin, map, of, Subject, takeUntil, tap } from "rxjs";
import { Partner, PartnerDto } from "@domain/project/partner.model";
import { LoggerService } from "@corelib";
import { CreatePartnerUseCase } from "../../use-cases/create-partner.use-case";
import { DeletePartnerUseCase } from "../../use-cases/delete-partner.use-case";

@Injectable({
  providedIn: "root",
})
export class ProjectPartnerService {
  private readonly fb = inject(FormBuilder);
  private partnerForm!: FormGroup;
  private readonly loggerService = inject(LoggerService);
  private readonly createPartnerUseCase = inject(CreatePartnerUseCase);
  private readonly deletePartnerUseCase = inject(DeletePartnerUseCase);

  public readonly partnerItems = signal<
    Partial<{ id: null; name: string; inn: string; contribution: string; decisionMaker: string }>[]
  >([]);

  private readonly destroy$ = new Subject<void>();

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

    if (partnerFormArray && partnerFormArray.length > 0) {
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

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  readonly hasPartners = computed(() => this.partnerItems().length > 0);

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
  public removePartner(index: number, partnersId: number, projectId: number): void {
    const partnerFormArray = this.partners;

    this.partnerItems.update(items => items.filter((_, i) => i !== index));
    partnerFormArray.removeAt(index);

    if (partnersId === null || partnersId === undefined) {
      return;
    }

    this.deletePartnerUseCase
      .execute(projectId, partnersId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          this.loggerService.error("Failed to delete partner", result.error.cause);
        }
      });
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

    const requests = partners
      .map((partner, idx) => ({ partner, idx }))
      .filter(({ partner }) => partner.id === null)
      .filter(
        ({ partner }) =>
          !!partner.name && !!partner.inn && !!partner.contribution && !!partner.decisionMaker
      )
      .map(({ partner, idx }) => {
        const decisionMakerPath = String(partner.decisionMaker).split("/");
        const decisionMaker = Number(decisionMakerPath[decisionMakerPath.length - 1]);

        if (!Number.isFinite(decisionMaker) || decisionMaker <= 0) {
          return of({
            __error: true,
            err: new Error("Invalid decisionMaker id"),
            original: partner,
            idx,
          });
        }

        const payload: PartnerDto = {
          name: partner.name,
          inn: partner.inn,
          contribution: partner.contribution,
          decisionMaker,
        };

        return this.createPartnerUseCase.execute(projectId, payload).pipe(
          map(result =>
            result.ok
              ? { res: result.value, idx }
              : { __error: true, err: result.error.cause, original: partner, idx }
          ),
          catchError(err => of({ __error: true, err, original: partner, idx }))
        );
      });

    if (!requests.length) {
      return of([]);
    }

    return forkJoin(requests).pipe(
      tap(results => {
        results.forEach((r: any) => {
          if (r && r.__error) {
            this.loggerService.error("Failed to post partner", r.err);
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
            this.loggerService.warn("addPartner response has no id field:", r.res);
          }
        });

        this.syncPartnerItems(this.partners);
      })
    );
  }
}
