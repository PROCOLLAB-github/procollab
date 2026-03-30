/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { catchError, forkJoin, map, of, Subject, takeUntil, tap } from "rxjs";
import { Resource, ResourceDto } from "@domain/project/resource.model";
import { LoggerService } from "@corelib";
import { DeleteResourceUseCase } from "../../use-case/delete-resource.use-case";
import { CreateResourceUseCase } from "../../use-case/create-resource.use-case";
import { UpdateResourceUseCase } from "../../use-case/update-resource.use-case";

@Injectable({
  providedIn: "root",
})
export class ProjectResourceService {
  private readonly fb = inject(FormBuilder);
  private readonly loggerService = inject(LoggerService);
  private readonly deleteResourceUseCase = inject(DeleteResourceUseCase);
  private readonly createResourceUseCase = inject(CreateResourceUseCase);
  private readonly updateResourceUseCase = inject(UpdateResourceUseCase);

  private resourceForm!: FormGroup;
  public readonly resourceItems = signal<
    Partial<{ id: null; type: string; description: string; partnerCompany: string }>[]
  >([]);

  private readonly destroy$ = new Subject<void>();

  /** Флаг инициализации сервиса */
  private initialized = false;

  constructor() {
    this.initializeResourceForm();
  }

  private initializeResourceForm(): void {
    this.resourceForm = this.fb.group({
      resources: this.fb.array([]),
      type: [null],
      description: [null, Validators.maxLength(200)],
      partnerCompany: [null],
    });
  }

  /**
   * Инициализирует сигнал resourceItems из данных FormArray
   * Вызывается при первом обращении к данным
   */
  public initializePartnerItems(resourceFormArray: FormArray): void {
    if (this.initialized) return;

    if (resourceFormArray && this.resourceItems().length > 0) {
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
  public initializeResourcesFromProject(resources: Resource[]): void {
    const resourcesFormArray = this.resources;

    while (resourcesFormArray.length !== 0) {
      resourcesFormArray.removeAt(0);
    }

    if (resources && Array.isArray(resources)) {
      resources.forEach(resource => {
        const partnerGroup = this.fb.group({
          id: [resource.id ?? null],
          type: [resource.type, Validators.required],
          description: [resource.description, Validators.required],
          partnerCompany: [resource.partnerCompany, Validators.required],
        });
        resourcesFormArray.push(partnerGroup);
      });

      this.syncResourceItems(resourcesFormArray);
    } else {
      this.resourceItems.set([]);
    }
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  readonly hasResources = computed(() => this.resourceItems().length > 0);

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
    return this.resourceForm.get("type") as FormControl;
  }

  public get resoruceDescription(): FormControl {
    return this.resourceForm.get("description") as FormControl;
  }

  public get resourcePartner(): FormControl {
    return this.resourceForm.get("partnerCompany") as FormControl;
  }

  /**
   * Добавляет нового ресурса или сохраняет изменения существующей.
   * @param type - тип ресурса (опционально)
   * @param description - описание ресурса (опционально)
   * @param partnerCompany - ссылка на партнера (опционально)
   */
  public addResource(type?: string, description?: string, partnerCompany?: string): void {
    const resourcesFormArray = this.resources;

    this.initializePartnerItems(resourcesFormArray);

    const resourceType = type || this.resourceForm.get("type")?.value;
    const resourceDescription = description || this.resourceForm.get("description")?.value;
    const partner = partnerCompany || this.resourceForm.get("partnerCompany")?.value;

    if (
      !resourceType ||
      !resourceDescription ||
      !partner ||
      resourceType.trim().length === 0 ||
      resourceDescription.trim().length === 0 ||
      partner.trim().length === 0
    ) {
      return;
    }

    const resourceItem = this.fb.group({
      id: [null],
      type: [resourceType.trim(), Validators.required],
      description: [resourceDescription.trim(), Validators.required],
      partnerCompany: [partner, Validators.required],
    });

    this.resourceItems.update(items => [...items, resourceItem.value]);
    resourcesFormArray.push(resourceItem);
  }

  /**
   * Удаляет ресурс по указанному индексу.
   * @param index индекс удаляемого партнера
   */
  public removeResource(index: number, resourceId: number, projectId: number): void {
    const resourceFormArray = this.resources;

    this.resourceItems.update(items => items.filter((_, i) => i !== index));
    resourceFormArray.removeAt(index);

    if (resourceId === null || resourceId === undefined) {
      return;
    }

    this.deleteResourceUseCase
      .execute(projectId, resourceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
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

  /**
   * Получает данные все ресурсы для отправки на сервер
   * @returns массив объектов ресурсов
   */
  public getResourcesData(): any[] {
    return this.resources.value.map((resource: Resource) => ({
      id: resource.id ?? null,
      type: resource.type,
      description: resource.description,
      partnerCompany: resource.partnerCompany,
    }));
  }

  /**
   * Сохраняет только новых ресурсов (у которых id === null) — отправляет POST.
   * После ответов присваивает полученные id в соответствующие FormGroup.
   * Возвращает Observable массива результатов (в порядке отправки).
   */
  public saveResources(projectId: number) {
    const resources = this.getResourcesData();

    const requests = resources
      .map((resource, idx) => ({ resource, idx }))
      .filter(({ resource }) => resource.id === null)
      .filter(({ resource }) => !!resource.type && !!resource.description)
      .map(({ resource, idx }) => {
        const payload: Omit<ResourceDto, "projectId"> = {
          type: resource.type,
          description: resource.description,
          partnerCompany: resource.partnerCompany ?? "запрос к рынку",
        };

        return this.createResourceUseCase.execute(projectId, payload).pipe(
          map(result =>
            result.ok
              ? { res: result.value, idx }
              : { __error: true, err: result.error.cause, original: resource, idx }
          ),
          catchError(err => of({ __error: true, err, original: resource, idx }))
        );
      });

    if (!requests.length) {
      return of([]);
    }

    return forkJoin(requests).pipe(
      tap(results => {
        results.forEach((r: any) => {
          if (r && r.__error) {
            this.loggerService.error("Failed to post resource", r.err);
            return;
          }

          const created = r.res;
          const idx = r.idx;

          if (created && created.id !== undefined && created.id !== null) {
            const formGroup = this.resources.at(idx);
            if (formGroup) {
              formGroup.get("id")?.setValue(created.id);
            }
          }
        });

        this.syncResourceItems(this.resources);
      })
    );
  }

  public editResources(projectId: number) {
    const resources = this.getResourcesData();

    const requests = resources
      .map((resource, idx) => ({ resource, idx }))
      .filter(({ resource }) => resource.id !== null && resource.id !== undefined)
      .filter(({ resource }) => !!resource.type && !!resource.description)
      .map(({ resource, idx }) => {
        const payload: Omit<ResourceDto, "projectId"> = {
          type: resource.type,
          description: resource.description,
          partnerCompany: resource.partnerCompany ?? "запрос к рынку",
        };

        return this.updateResourceUseCase.execute(projectId, resource.id, payload).pipe(
          map(result =>
            result.ok
              ? { res: result.value, idx }
              : { __error: true, err: result.error.cause, original: resource, idx }
          ),
          catchError(err => of({ __error: true, err, original: resource, idx }))
        );
      });

    if (!requests.length) {
      return of([]);
    }

    return forkJoin(requests).pipe(
      tap(results => {
        results.forEach((r: any) => {
          if (r && r.__error) {
            this.loggerService.error("Failed to add resource", r.err);
            return;
          }

          const created = r.res;
          const idx = r.idx;

          if (created && created.id !== undefined && created.id !== null) {
            const formGroup = this.resources.at(idx);
            if (formGroup) {
              formGroup.get("id")?.setValue(created.id);
            }
          } else {
            this.loggerService.warn("addResource response has no id field:", r.res);
          }
        });

        this.syncResourceItems(this.resources);
      })
    );
  }
}
