/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Subject, take, takeUntil } from "rxjs";
import { Specialization } from "../../domain/specializations/specialization";
import { FormGroup } from "@angular/forms";
import { SpecializationsService } from "../specializations/specializations.service";

@Injectable({ providedIn: "root" })
export class SearchesService {
  private readonly specsService = inject(SpecializationsService);

  readonly inlineSpecs = signal<Specialization[]>([]);

  private readonly destroy$ = new Subject<void>();

  /**
   * Выбор специальности из автокомплита
   * @param speciality - выбранная специальность
   */
  onSelectSpec(form: FormGroup, speciality: Specialization): void {
    form.patchValue({ speciality: speciality.name });
  }

  onSearchSpec(query: string): void {
    this.specsService
      .getSpecializationsInline(query, 1000, 0)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(({ results }) => {
        this.inlineSpecs.set(results);
      });
  }
}
