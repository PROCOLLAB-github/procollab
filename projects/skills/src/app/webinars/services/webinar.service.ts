/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { plainToInstance } from "class-transformer";
import { Webinar } from "projects/skills/src/models/webinars.model";
import { map, Observable } from "rxjs";

/**
 * Сервис для работы с вебинарами
 *
 * Предоставляет методы для получения информации о вебинарах,
 * управления регистрацией и доступом к записям.
 *
 * Взаимодействует с API вебинаров и обрабатывает трансформацию
 * данных в типизированные модели.
 */
@Injectable({
  providedIn: "root",
})
export class WebinarService {
  private readonly WEBINAR_URL = "/webinars";

  constructor(private readonly apiService: SkillsApiService) {}

  /**
   * Получение списка актуальных (предстоящих) вебинаров
   *
   * Загружает вебинары, которые еще не прошли и доступны
   * для регистрации и участия
   *
   * @param limit - количество вебинаров для загрузки
   * @param offset - смещение для пагинации
   * @returns Observable<Webinar[]> - массив актуальных вебинаров
   */
  getActualWebinars(limit: number, offset: number): Observable<Webinar[]> {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService
      .get<Webinar[]>(`${this.WEBINAR_URL}/actual/`, params)
      .pipe(map(webinar => plainToInstance(Webinar, webinar)));
  }

  /**
   * Получение списка записей завершенных вебинаров
   *
   * Загружает вебинары, которые уже прошли и доступны
   * для просмотра в записи
   *
   * @param limit - количество записей для загрузки
   * @param offset - смещение для пагинации
   * @returns Observable - пагинированный список записей вебинаров
   */
  getRecords(limit: number, offset: number) {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService
      .get<Webinar[]>(`${this.WEBINAR_URL}/records/`, params)
      .pipe(map(webinar => plainToInstance(Webinar, webinar)));
  }

  /**
   * Получение ссылки на запись вебинара
   *
   * Предоставляет прямую ссылку для просмотра записи
   * конкретного завершенного вебинара
   *
   * @param webinarId - идентификатор вебинара
   * @returns Observable<{recordingLink: string}> - объект со ссылкой на запись
   */
  getWebinarLink(webinarId: number) {
    return this.apiService.get<{ recordingLink: string }>(
      `${this.WEBINAR_URL}/records/${webinarId}/link/`
    );
  }

  /**
   * Регистрация пользователя на вебинар
   *
   * Выполняет регистрацию текущего пользователя на предстоящий вебинар.
   * После успешной регистрации пользователь получит уведомления
   * и доступ к участию в вебинаре.
   *
   * @param webinarId - идентификатор вебинара для регистрации
   * @returns Observable - результат операции регистрации
   */
  registrationOnWebinar(webinarId: number) {
    return this.apiService.post(`${this.WEBINAR_URL}/actual/${webinarId}/`, {});
  }
}
