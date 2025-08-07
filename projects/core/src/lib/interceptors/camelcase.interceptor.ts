/** @format */

import { Injectable } from "@angular/core";
import {
  type HttpEvent,
  type HttpHandler,
  type HttpInterceptor,
  type HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { map, type Observable } from "rxjs";
import * as snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";

/**
 * HTTP интерцептор для автоматического преобразования стиля именования ключей объектов
 *
 * Назначение:
 * - Обеспечивает совместимость между frontend (camelCase) и backend (snake_case)
 * - Автоматически преобразует все ключи объектов в запросах и ответах
 * - Работает рекурсивно с вложенными объектами (deep: true)
 *
 * Преобразования:
 * 1. Исходящие запросы: camelCase → snake_case
 *    Пример: { firstName: "John" } → { first_name: "John" }
 *
 * 2. Входящие ответы: snake_case → camelCase
 *    Пример: { first_name: "John" } → { firstName: "John" }
 *
 * Применяется ко всем HTTP запросам автоматически
 */
@Injectable()
export class CamelcaseInterceptor implements HttpInterceptor {
  constructor() {}

  /**
   * Основной метод интерцептора
   * @param request - Исходящий HTTP запрос (может содержать тело с camelCase ключами)
   * @param next - Следующий обработчик в цепочке интерцепторов
   * @returns Observable с HTTP событием (ответ будет содержать camelCase ключи)
   */
  intercept(
    request: HttpRequest<Record<string, any>>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let req: HttpRequest<Record<string, any>>;

    // Обрабатываем тело запроса если оно существует
    if (request.body) {
      // Клонируем запрос с преобразованным телом (camelCase → snake_case)
      req = request.clone({
        body: snakecaseKeys(request.body, {
          deep: true, // Рекурсивное преобразование вложенных объектов
        }),
      });
    } else {
      // Если тела нет, просто клонируем запрос
      req = request.clone();
    }

    // Выполняем запрос и обрабатываем ответ
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        // Обрабатываем только HTTP ответы (не события загрузки и т.д.)
        if (event instanceof HttpResponse) {
          // Клонируем ответ с преобразованным телом (snake_case → camelCase)
          return event.clone({
            body: camelcaseKeys(event.body, {
              deep: true, // Рекурсивное преобразование вложенных объектов
            }),
          });
        }

        // Для других типов событий возвращаем как есть
        return event;
      })
    );
  }
}
