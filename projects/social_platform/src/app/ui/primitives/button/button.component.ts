/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "../loader/loader.component";

/**
 * Универсальный компонент кнопки с различными стилями, состояниями и встроенной подсказкой.
 * Поддерживает различные цветовые схемы, индикатор загрузки, настройки внешнего вида и tooltip.
 *
 * Входящие параметры:
 * - color: цветовая схема кнопки ("primary" | "red" | "grey" | "green" | "gold" | "gradient" | "white")
 * - loader: показывать индикатор загрузки
 * - hasBorder: отображать рамку кнопки
 * - type: тип кнопки для HTML ("submit" | "reset" | "button")
 * - appearance: стиль отображения ("inline" | "outline")
 * - backgroundColor: кастомный цвет фона
 * - disabled: состояние блокировки кнопки
 * - customTypographyClass: кастомный CSS класс для типографики
 *
 * Использование:
 * - Вставлять контент кнопки через ng-content
 * - Автоматически показывает лоадер при loader=true
 */
@Component({
    selector: "app-button",
    templateUrl: "./button.component.html",
    styleUrl: "./button.component.scss",
    imports: [CommonModule, LoaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  /** Цветовая схема кнопки */
  color = input<"primary" | "red" | "grey" | "green" | "gold" | "gradient" | "white">("primary");

  /** Показывать индикатор загрузки */
  loader = input(false);

  /** Размер кнопки */
  size = input<"extra-small" | "small" | "medium" | "big">("small");

  /** Отображать рамку */
  hasBorder = input(true);

  /** Тип HTML кнопки */
  type = input<"submit" | "reset" | "button" | "icon">("button");

  /** Стиль отображения */
  appearance = input<"inline" | "outline">("inline");

  /** Кастомный цвет фона */
  backgroundColor = input<string>();

  /** Состояние блокировки */
  disabled = input(false);

  /** Кастомный класс типографики */
  customTypographyClass = input<string>();
}
