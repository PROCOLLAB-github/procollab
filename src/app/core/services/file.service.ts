/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor(private apiService: ApiService) {}

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.apiService.post("/file/upload", formData);
  }
}
