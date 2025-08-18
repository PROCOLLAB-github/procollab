/** @format */

import { UpperCasePipe } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@ui/components";
import { LinkTransformPipe } from "projects/core/src/lib/pipes/link-transform.pipe";

/**
 * Компонент карточки ссылки или достижения
 *
 * Функциональность:
 * - Отображает ссылку или достижение в виде карточки
 * - Поддерживает два типа: "link" (ссылка) и "achievement" (достижение)
 * - Предоставляет кнопки для редактирования и удаления
 * - Использует трансформацию ссылок через LinkTransformPipe
 * - Отображает данные в формате JSON для отладки
 *
 * Входные параметры:
 * @Input data - данные ссылки или достижения (любой объект)
 * @Input type - тип карточки: "link" или "achievement" (по умолчанию "link")
 *
 * Выходные события:
 * @Output remove - событие удаления, передает ID элемента
 * @Output edit - событие редактирования, передает ID элемента
 */
@Component({
  selector: "app-link-card",
  templateUrl: "./link-card.component.html",
  styleUrl: "./link-card.component.scss",
  standalone: true,
  imports: [IconComponent, LinkTransformPipe, UpperCasePipe],
})
export class LinkCardComponent {
  constructor() {}

  @Input() data?: any;
  @Input() type: "link" | "achievement" = "link";
  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  /**
   * Обработчик удаления элемента
   * Предотвращает всплытие события и эмитит событие удаления
   */
  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.data?.id);
  }

  /**
   * Обработчик редактирования элемента
   * Предотвращает всплытие события и эмитит событие редактирования
   */
  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.edit.emit(this.data?.id);
  }
}
