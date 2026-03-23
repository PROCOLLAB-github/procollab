/** @format */

import { Signal } from "@angular/core";
import { Observable } from "rxjs";
import { Industry } from "../industry.model";

/**
 * Порт репозитория отраслей.
 * Реализуется в infrastructure/repository/industry/industry.repository.ts
 */
export abstract class IndustryRepositoryPort {
  abstract readonly industries: Signal<Industry[]>;

  abstract getAll(): Observable<Industry[]>;
  abstract getOne(industryId: number): Industry | undefined;
}
