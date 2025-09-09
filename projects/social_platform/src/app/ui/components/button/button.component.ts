/** @format */

import { Component, Input, type OnInit } from "@angular/core";
import { LoaderComponent } from "../loader/loader.component";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";

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
 * - haveHint: наличие подсказки
 * - tooltipText: текст подсказки
 * - tooltipPosition: позиция подсказки
 * - tooltipWidth: ширина подсказки
 *
 * Использование:
 * - Вставлять контент кнопки через ng-content
 * - Автоматически показывает лоадер при loader=true
 * - Показывает tooltip при наведении, если указан tooltipText
 */
@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.scss",
  standalone: true,
  imports: [CommonModule, LoaderComponent, IconComponent],
})
export class ButtonComponent implements OnInit {
  constructor() {}

  /** Цветовая схема кнопки */
  @Input() color: "primary" | "red" | "grey" | "green" | "gold" | "gradient" | "white" = "primary";

  /** Показывать индикатор загрузки */
  @Input() loader = false;

  /** Размер кнопки */
  @Input() size: "small" | "medium" | "big" = "small";

  /** Отображать рамку */
  @Input() hasBorder = true;

  /** Тип HTML кнопки */
  @Input() type: "submit" | "reset" | "button" | "icon" = "button";

  /** Стиль отображения */
  @Input() appearance: "inline" | "outline" = "inline";

  /** Кастомный цвет фона */
  @Input() backgroundColor?: string;

  /** Состояние блокировки */
  @Input() disabled = false;

  /** Кастомный класс типографики */
  @Input() customTypographyClass?: string;

  ngOnInit(): void {}
}
