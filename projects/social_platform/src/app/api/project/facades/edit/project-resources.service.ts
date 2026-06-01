/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { catchError, forkJoin, map, of, tap } from "rxjs";
import { Resource, ResourceDto } from "@domain/project/resource.model";
import { LoggerService } from "@corelib";
import { DeleteResourceUseCase } from "../../use-cases/delete-resource.use-case";
import { CreateResourceUseCase } from "../../use-cases/create-resource.use-case";
import { UpdateResourceUseCase } from "../../use-cases/update-resource.use-case";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад ресурсов проекта: создание/обновление/удаление ресурсов. */
@Injectable({
  providedIn: "root",
})
export class ProjectResourceService {
  private readonly fb = inject(FormBuilder);
  private readonly loggerService = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly deleteResourceUseCase = inject(DeleteResourceUseCase);
  private readonly createResourceUseCase = inject(CreateResourceUseCase);
  private readonly updateResourceUseCase = inject(UpdateResourceUseCase);

  private resourceForm!: FormGroup;
  public readonly resourceItems = signal<
    Partial<{ id: null; type: string; description: string; partnerCompany: string }>[]
  >([]);

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

  public initializePartnerItems(resourceFormArray: FormArray): void {
    if (this.initialized) return;

    if (resourceFormArray && this.resourceItems().length > 0) {
      this.resourceItems.set(resourceFormArray.value);
    }

    this.initialized = true;
  }

  public syncResourceItems(resourceFormArray: FormArray): void {
    if (resourceFormArray) {
      this.resourceItems.set(resourceFormArray.value);
    }
  }

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

  readonly hasResources = computed(() => this.resourceItems().length > 0);

  public getForm(): FormGroup {
    return this.resourceForm;
  }

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

  public removeResource(index: number, resourceId: number, projectId: number): void {
    const resourceFormArray = this.resources;

    this.resourceItems.update(items => items.filter((_, i) => i !== index));
    resourceFormArray.removeAt(index);

    if (resourceId === null || resourceId === undefined) {
      return;
    }

    this.deleteResourceUseCase
      .execute(projectId, resourceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

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

  public getResourcesData(): any[] {
    return this.resources.value.map((resource: Resource) => ({
      id: resource.id ?? null,
      type: resource.type,
      description: resource.description,
      partnerCompany: resource.partnerCompany,
    }));
  }

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
