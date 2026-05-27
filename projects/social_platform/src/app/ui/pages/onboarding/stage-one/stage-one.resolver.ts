/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { GetSpecializationsNestedUseCase } from "@api/specializations/use-cases/get-specializations-nested.use-case";
import { SpecializationsGroup } from "@domain/specializations/specializations-group.model";
import { EMPTY, map } from "rxjs";

/** Предзагружает иерархическую структуру специализаций для онбординга. */
export const StageOneResolver: ResolveFn<SpecializationsGroup[]> = () => {
  const getSpecializationsNestedUseCase = inject(GetSpecializationsNestedUseCase);

  return getSpecializationsNestedUseCase
    .execute()
    .pipe(map(result => (result.ok ? result.value : [])));
};
