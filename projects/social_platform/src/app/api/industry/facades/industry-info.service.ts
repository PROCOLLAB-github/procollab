/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Industry } from "@domain/industry/industry.model";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

@Injectable({ providedIn: "root" })
export class IndustryInfoService {
  private readonly industryRepository = inject(IndustryRepositoryPort);

  readonly industries = this.industryRepository.industries;

  getAll(): Observable<Industry[]> {
    return this.industryRepository.getAll();
  }

  getOne(industryId: number): Industry | undefined {
    return this.industryRepository.getOne(industryId);
  }
}
