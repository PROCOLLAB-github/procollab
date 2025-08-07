/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@ui/components";
import { Specialization } from "@office/models/specialization";

/**
 * Компонент группы специализаций с возможностью сворачивания/разворачивания
 *
 * Функциональность:
 * - Отображает заголовок группы специализаций
 * - Показывает/скрывает список специализаций при клике на заголовок
 * - Позволяет выбирать специализацию из списка
 * - Использует OnPush стратегию для оптимизации производительности
 *
 * Входные параметры:
 * @Input title - заголовок группы специализаций (обязательный)
 * @Input options - массив специализаций для отображения (обязательный)
 *
 * Выходные события:
 * @Output selectOption - событие выбора специализации, передает выбранную специализацию
 *
 * Внутренние свойства:
 * - contentVisible - флаг видимости содержимого группы
 */
@Component({
  selector: "app-specializations-group",
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: "./specializations-group.component.html",
  styleUrl: "./specializations-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecializationsGroupComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) options!: Specialization[];
  @Output() selectOption = new EventEmitter<Specialization>();

  contentVisible = false;

  /**
   * Обработчик выбора специализации
   * Эмитит событие с выбранной специализацией
   */
  onSelectOption(opt: Specialization) {
    this.selectOption.emit(opt);
  }
}
