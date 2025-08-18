/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, type Observer } from "rxjs";

/**
 * Сервис для управления модальными окнами подтверждения удаления.
 * Предоставляет методы для отображения диалогов подтверждения и управления их состоянием.
 *
 * Методы:
 * - confirmDelete: показывает диалог подтверждения удаления
 *
 * Возвращает:
 * - Observable<boolean> с результатом выбора пользователя (true - подтвердить, false - отменить)
 */
@Injectable({
  providedIn: "root",
})
export class ModalService {
  constructor() {}

  /** Observer для обработки результата подтверждения */
  confirmObserver?: Observer<boolean>;

  /** Настройки текста для диалога подтверждения */
  confirmSettings = new BehaviorSubject<{ mainText: string; subText: string }>({
    mainText: "",
    subText: "",
  });

  /** Состояние отображения диалога подтверждения */
  confirmState = false;

  /**
   * Показывает диалог подтверждения удаления
   * @param mainText - основной текст сообщения
   * @param subText - дополнительный текст сообщения
   * @returns Observable<boolean> - результат выбора пользователя
   */
  confirmDelete(mainText: string, subText: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.confirmState = true;

      this.confirmObserver = observer;
      this.confirmSettings.next({
        mainText,
        subText,
      });
    });
  }
}
