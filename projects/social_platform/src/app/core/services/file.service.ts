/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { AuthService } from "@auth/services";
import { environment } from "@environment";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor(private readonly apiService: ApiService, private readonly authService: AuthService) {}

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
