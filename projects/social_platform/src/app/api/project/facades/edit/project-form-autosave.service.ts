/** @format */

import { inject, Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { filter, Observable, Subject, takeUntil, concatMap } from "rxjs";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";

type AutosaveField = "presentationAddress" | "coverImageAddress";

@Injectable({ providedIn: "root" })
export class ProjectFormAutosaveService {
  private readonly route = inject(ActivatedRoute);
  private readonly updateFormUseCase = inject(UpdateFormUseCase);

  bindDraftCleanupAutosave(
    control: AbstractControl | null,
    field: AutosaveField,
    destroy$: Observable<void> | Subject<void>
  ): void {
    control?.valueChanges
      .pipe(
        filter(value => !value),
        concatMap(() =>
          this.updateFormUseCase.execute({
            id: Number(this.route.snapshot.params["projectId"]),
            data: {
              [field]: "",
              draft: true,
            },
          })
        ),
        filter(result => result.ok),
        takeUntil(destroy$)
      )
      .subscribe();
  }
}
