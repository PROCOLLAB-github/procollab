/** @format */

import { inject, Injectable } from "@angular/core";
import { Industry } from "@domain/industry/industry.model";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

/**
 * Тонкий фасад справочника отраслей: проксирует сигнал `industries` и
 * синхронный `getOne(id)` из `IndustryRepositoryPort`, чтобы UI/api-слой
 * не лез напрямую в `IndustryRepository` (см. долг A3 в docs/modules/industry.md).
 * Загрузка справочника — через `GetIndustriesUseCase` (вызывается из shell).
 */
@Injectable({ providedIn: "root" })
export class IndustryInfoService {
  private readonly industryRepository = inject(IndustryRepositoryPort);

  readonly industries = this.industryRepository.industries;

  getOne(industryId: number): Industry | undefined {
    return this.industryRepository.getOne(industryId);
  }
}
