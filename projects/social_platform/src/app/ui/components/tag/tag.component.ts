/** @format */

import { Component, Input, OnInit } from "@angular/core";

/**
 * Компонент тега для отображения статусов, категорий или меток.
 * Поддерживает различные цветовые схемы для визуального разделения типов.
 *
 * Входящие параметры:
 * - color: цветовая схема тега ("primary" | "accent" | "complete")
 *
 * Использование:
 * - Отображение статусов задач, заказов
 * - Категоризация контента
 * - Визуальные метки и индикаторы
 * - Контент передается через ng-content
 */
@Component({
  selector: "app-tag",
  templateUrl: "./tag.component.html",
  styleUrl: "./tag.component.scss",
  standalone: true,
})
export class TagComponent implements OnInit {
  constructor() {}

  /** Цветовая схема тега */
  @Input() color: "primary" | "secondary" | "accent" | "complete" | "soft" = "primary";

  /** Стиль отображения */
  @Input() appearance: "inline" | "outline" = "inline";

  ngOnInit(): void {}
}
