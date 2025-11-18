/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IconComponent } from "../icon/icon.component";

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
  imports: [IconComponent],
})
export class TagComponent implements OnInit {
  constructor() {}

  /** Цветовая схема тега */
  @Input() color: "primary" | "secondary" | "accent" | "complete" | "soft" = "primary";

  /** Стиль отображения */
  @Input() appearance: "inline" | "outline" = "inline";

  /** Возможность редактирования */
  @Input() canEdit?: boolean;

  /** Возможность удаления */
  @Input() canDelete?: boolean;

  /** Событие для возможности удаления */
  @Output() delete = new EventEmitter<void>();

  /** Событие для возможности редактирования */
  @Output() edit = new EventEmitter<void>();

  ngOnInit(): void {}

  /** Метод для вызова удаления элемента */
  onDelete(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit();
  }

  /** Метод для вызова редактирования элемента */
  onEdit(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.edit.emit();
  }
}
