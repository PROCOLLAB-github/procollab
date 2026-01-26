/** @format */

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { IconComponent } from "../icon/icon.component";
import { tagColors } from "projects/core/src/consts/other/tag-colors.const";
import { NgStyle } from "@angular/common";

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
  imports: [IconComponent, NgStyle],
})
export class TagComponent implements OnInit, OnChanges {
  constructor() {}

  /** Цветовая схема тега */
  @Input() color:
    | "primary"
    | "secondary"
    | "accent"
    | "accent-medium"
    | "blue-dark"
    | "cyan"
    | "red"
    | "complete"
    | "complete-dark"
    | "soft" = "primary";

  @Input() type?: "days" | "overdue" | "answer";

  /** Стиль отображения */
  @Input() appearance: "inline" | "outline" = "inline";

  /** Возможность редактирования */
  @Input() canEdit?: boolean;

  /** Возможность удаления */
  @Input() canDelete?: boolean;

  @Input() isKanbanTag = false;

  /** Событие для возможности удаления */
  @Output() delete = new EventEmitter<void>();

  /** Событие для возможности редактирования */
  @Output() edit = new EventEmitter<void>();

  get tagColors() {
    return tagColors;
  }

  additionalTagColor = "";

  ngOnInit(): void {
    this.mappingAdditionalTagColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["color"]) {
      this.mappingAdditionalTagColors();
    }
  }

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

  private mappingAdditionalTagColors(): void {
    if (!this.isKanbanTag) {
      this.additionalTagColor = "";
      return;
    }

    const found = tagColors.find(tagColor => tagColor.name === this.color);
    if (found) {
      this.additionalTagColor = found.color;
    }
  }
}
