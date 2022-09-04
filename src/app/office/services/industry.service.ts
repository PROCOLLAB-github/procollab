/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { Industry } from "../models/industry.model";
import { plainToClass } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class IndustryService {
  constructor(private apiService: ApiService) {}

  private industries$ = new BehaviorSubject<Industry[]>([]);
  industries = this.industries$.asObservable();

  getAll(): Observable<Industry[]> {
    return this.apiService.get<Industry[]>("/industry").pipe(
      map(industries => plainToClass(Industry, industries)),
      tap(industries => {
        this.industries$.next(industries);
      })
    );
  }

  getIndustry(industries: Industry[], industryId: number): Industry | undefined {
    return industries.find(industry => industry.id === industryId);
  }
}
