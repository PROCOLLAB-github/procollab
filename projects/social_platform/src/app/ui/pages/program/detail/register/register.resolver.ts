/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramDataSchema } from "@domain/program/program.model";
import { map } from "rxjs";
import { GetProgramDataSchemaUseCase } from "@api/program/use-cases/get-program-data-schema.use-case";

/** Предзагружает схему полей регистрации в программе. */
export const ProgramRegisterResolver: ResolveFn<ProgramDataSchema> = (
  route: ActivatedRouteSnapshot,
) => {
  const getProgramDataSchemaUseCase = inject(GetProgramDataSchemaUseCase);

  return getProgramDataSchemaUseCase
    .execute(route.params["programId"])
    .pipe(map(result => (result.ok ? result.value : new ProgramDataSchema())));
};
