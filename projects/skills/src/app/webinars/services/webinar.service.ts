/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { plainToInstance } from "class-transformer";
import { Webinar } from "projects/skills/src/models/webinars.model";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WebinarService {
  constructor(private readonly apiService: ApiService) {}

  getActualWebinars(limit: number, offset: number): Observable<Webinar[]> {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService
      .get<Webinar[]>("/webinars/actual/", params)
      .pipe(map(webinar => plainToInstance(Webinar, webinar)));
  }

  getRecords(limit: number, offset: number) {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService
      .get<Webinar[]>("/webinars/records/", params)
      .pipe(map(webinar => plainToInstance(Webinar, webinar)));
  }

  getWebinarLink(webinarId: number) {
    return this.apiService.get<{ recordingLink: string }>(`/webinars/records/${webinarId}/link/`);
  }

  registrationOnWebinar(webinarId: number) {
    return this.apiService.post(`/webinars/actual/${webinarId}/`, {});
  }
}
