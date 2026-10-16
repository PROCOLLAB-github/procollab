/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { University } from "@domain/profile/university.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class UniversityHttpAdapter {
  private readonly api = inject(ApiService);

  search(search: string, offset = 0): Observable<ApiPagination<University>> {
    return this.api.get(
      "/auth/universities/",
      new HttpParams({ fromObject: { search, offset, limit: 30 } }),
    );
  }
}
