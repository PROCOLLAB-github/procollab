/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor(private apiService: ApiService) {}

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.apiService.post("/files/upload", formData);
  }

  deleteFile(fileUrl: string): Observable<{ success: true }> {
    const params = new HttpParams({ fromObject: { url: fileUrl } });
    return this.apiService.delete("/files", params);
  }
}
