/** @format */

import { Injectable } from "@angular/core";
import { ApiService, TokenService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { environment } from "@environment";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor(private readonly tokenService: TokenService, private apiService: ApiService) {}

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return new Observable<{ url: string }>(observer => {
      fetch(`${environment.apiUrl}/files/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.tokenService.getTokens()?.access}`,
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
