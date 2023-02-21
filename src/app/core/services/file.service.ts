/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "../../auth/services";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor(
    private apiService: ApiService,
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return new Observable<{ url: string }>(observer => {
      fetch(`${environment.apiUrl}/files/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authService.getTokens()?.access}`,
        },
        body: formData,
      })
        .then(res => res.json())
        .then(res => {
          observer.next(res);
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }

  deleteFile(fileUrl: string): Observable<{ success: true }> {
    const params = new HttpParams({ fromObject: { link: fileUrl } });
    return this.apiService.delete("/files/", params);
  }
}
