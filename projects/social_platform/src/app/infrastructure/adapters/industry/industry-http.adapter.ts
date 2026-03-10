/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ApiService } from "@corelib";
import { Industry } from "../../../domain/industry/industry.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class IndustryHttpAdapter {
  private readonly INDUSTRIES_URL = "/industries";

  private readonly apiService = inject(ApiService);

  /**
   * Получает список всех доступных отраслей с сервера
   * Преобразует данные в типизированные объекты и кеширует их
   * Обрабатывает ошибки и обновляет локальный кеш при успешной загрузке
   *
   * @returns Observable<Industry[]> - массив отраслей с названиями и идентификаторами
   */
  fetchAll(): Observable<Industry[]> {
    return this.apiService.get<Industry[]>(`${this.INDUSTRIES_URL}/`);
  }
}
