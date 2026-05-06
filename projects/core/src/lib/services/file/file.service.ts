/** @format */

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "../api/api.service";

/**
 * Сервис для работы с файлами
 * Предоставляет методы для загрузки и удаления файлов через API
 * Использует ApiService + HttpClient, поэтому авторизация, retry и camelCase
 * обрабатываются интерсепторами автоматически
 */
@Injectable({
  providedIn: "root",
})
export class FileService {
  private readonly FILES_URL = "/files";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Загружает файл на сервер
   *
   * @param file - объект File для загрузки
   * @returns Observable<{ url: string }> - Observable с URL загруженного файла
   *
   * Использует HttpClient через ApiService — интерсепторы (bearer token, retry, logging)
   * работают автоматически. CamelcaseInterceptor пропускает FormData без преобразования.
   */
  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return this.apiService.post<{ url: string }>(`${this.FILES_URL}/`, formData);
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
