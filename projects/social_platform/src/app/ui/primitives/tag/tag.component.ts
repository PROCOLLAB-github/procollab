/** @format */

import { ChangeDetectionStrategy, Component, computed, effect, input, output } from "@angular/core";
import { tagColors } from "@core/consts/other/tag-colors.const";
import { NgStyle } from "@angular/common";
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
  imports: [IconComponent, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  /** Цветовая схема тега */
  color = input<
    | "primary"
    | "secondary"
    | "accent"
    | "accent-medium"
    | "blue-dark"
    | "cyan"
    | "red"
    | "complete"
    | "complete-dark"
    | "soft"
  >("primary");

  type = input<"days" | "overdue" | "answer">();

  /** Стиль отображения */
  appearance = input<"inline" | "outline">("inline");

  /** Возможность редактирования */
  canEdit = input<boolean>();

  /** Возможность удаления */
  canDelete = input<boolean>();

  isKanbanTag = input(false);

  /** Событие для возможности удаления */
  delete = output<void>();

  /** Событие для возможности редактирования */
  edit = output<void>();

  get tagColors() {
    return tagColors;
  }

  additionalTagColor = "";

  constructor() {
    effect(() => {
      this.mappingAdditionalTagColors();
    });
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
    if (!this.isKanbanTag()) {
      this.additionalTagColor = "";
      return;
    }

    const found = tagColors.find(tagColor => tagColor.name === this.color());
    if (found) {
      this.additionalTagColor = found.color;
    }
  }
}
