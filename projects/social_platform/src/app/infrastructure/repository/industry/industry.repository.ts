/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { IndustryHttpAdapter } from "../../adapters/industry/industry-http.adapter";
import { map, Observable, tap } from "rxjs";
import { Industry } from "@domain/industry/industry.model";
import { plainToInstance } from "class-transformer";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

/** Репозиторий отраслей: signal-кеш `industries`, наполняется в `getAll` (`plainToInstance`); `getOne` — синхронный поиск в кеше. */
@Injectable({ providedIn: "root" })
export class IndustryRepository implements IndustryRepositoryPort {
  private readonly industryAdapter = inject(IndustryHttpAdapter);

  readonly industries = signal<Industry[]>([]);

  getAll(): Observable<Industry[]> {
    return this.industryAdapter.fetchAll().pipe(
      map(industries => plainToInstance(Industry, industries)),
      tap(industries => {
        this.industries.set(industries);
      })
    );
  }

  getOne(industryId: number): Industry | undefined {
    return this.industries().find(industry => industry.id === industryId);
  }
}
