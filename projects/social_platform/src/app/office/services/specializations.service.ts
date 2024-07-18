/** @format */

import { Injectable } from "@angular/core";
import { SpecializationsGroup } from "../models/specializations-group";
import { Observable } from "rxjs";
import { ApiService } from "@corelib";
import { Specialization } from "../models/specialization";
import { ApiPagination } from "@office/models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SpecializationsService {
  constructor(private apiService: ApiService) {}

  getSpecializationsNested(): Observable<SpecializationsGroup[]> {
    return this.apiService.get("/auth/users/specializations/nested");
  }

  getSpecializationsInline(
    search: string,
    limit: number,
    offset: number,
  ): Observable<ApiPagination<Specialization>> {
    return this.apiService.get(
      "/auth/users/specializations/inline",
      new HttpParams({ fromObject: { limit, offset, name__icontains: search } }),
    );
  }
}
