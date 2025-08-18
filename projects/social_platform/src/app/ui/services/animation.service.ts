/** @format */

import { Injectable } from "@angular/core";
import { animate, AnimationTriggerMetadata, style, transition, trigger } from "@angular/animations";

/**
 * Сервис для предоставления готовых анимаций Angular.
 * Содержит статические методы для получения анимационных триггеров.
 *
 * Доступные анимации:
 * - slideInOut: анимация появления/исчезновения с эффектом скольжения
 *
 * Возвращает:
 * - AnimationTriggerMetadata: готовый анимационный триггер для использования в компонентах
 */
@Injectable({
  providedIn: "root",
})
export class AnimationService {
  constructor() {}

  /**
   * Анимация появления и исчезновения элемента с эффектом скольжения справа
   * @returns AnimationTriggerMetadata - анимационный триггер
   */
  public static get slideInOut(): AnimationTriggerMetadata {
    return trigger("slideInOut", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100%)" }),
        animate(200, style({ opacity: 1, transform: "translateX(0)" })),
      ]),
      transition(":leave", [
        style({ opacity: 1, transform: "translateX(0)" }),
        animate(200, style({ opacity: 0, transform: "translateX(100%)" })),
      ]),
    ]);
  }
}
