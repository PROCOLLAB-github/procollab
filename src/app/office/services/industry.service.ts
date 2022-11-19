/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from "rxjs";
import { Industry } from "../models/industry.model";
import { plainToInstance } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class IndustryService {
  constructor(private apiService: ApiService) {}

  private industries$ = new BehaviorSubject<Industry[]>([]);
  industries = this.industries$.asObservable();

  getAll(): Observable<Industry[]> {
    return this.apiService.get<Industry[]>("/industries/").pipe(
      catchError(err => throwError(err)),
      map(industries => plainToInstance(Industry, industries)),
      tap(industries => {
        this.industries$.next(industries);
      })
    );
  }

  getIndustry(industries: Industry[], industryId: number): Industry | undefined {
    return industries.find(industry => industry.id === industryId);
  }
}
