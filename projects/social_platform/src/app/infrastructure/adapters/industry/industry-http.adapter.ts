/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ApiService } from "@corelib";
import { Industry } from "@domain/industry/industry.model";
import { Observable } from "rxjs";

/** HTTP-адаптер справочника отраслей: `/industries`. */
@Injectable({ providedIn: "root" })
export class IndustryHttpAdapter {
  private readonly INDUSTRIES_URL = "/industries";

  private readonly apiService = inject(ApiService);

  fetchAll(): Observable<Industry[]> {
    return this.apiService.get<Industry[]>(`${this.INDUSTRIES_URL}/`);
  }
}
