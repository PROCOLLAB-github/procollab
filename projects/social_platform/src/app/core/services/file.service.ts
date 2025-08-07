/** @format */

import { Injectable } from "@angular/core";
import { ApiService, TokenService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { environment } from "@environment";

/**
 * Сервис для работы с файлами
 * Предоставляет методы для загрузки и удаления файлов через API
 * Использует авторизацию через Bearer токен
 */
@Injectable({
  providedIn: "root",
})
export class FileService {
  private readonly FILES_URL = "/files";

  constructor(private readonly tokenService: TokenService, private apiService: ApiService) {}

  /**
   * Загружает файл на сервер
   *
   * @param file - объект File для загрузки
   * @returns Observable<{ url: string }> - Observable с URL загруженного файла
   *
   * Использует нативный fetch API вместо HttpClient для поддержки FormData
   * Автоматически добавляет Authorization header с Bearer токеном
   */
  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return new Observable<{ url: string }>(observer => {
      fetch(`${environment.apiUrl}${this.FILES_URL}/`, {
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

  /**
   * Удаляет файл с сервера по URL
   *
   * @param fileUrl - URL файла для удаления
   * @returns Observable<{ success: true }> - Observable с результатом операции
   *
   * Передает URL файла как query параметр 'link'
   */
  deleteFile(fileUrl: string): Observable<{ success: true }> {
    const params = new HttpParams({ fromObject: { link: fileUrl } });
    return this.apiService.delete(`${this.FILES_URL}/`, params);
  }
}
