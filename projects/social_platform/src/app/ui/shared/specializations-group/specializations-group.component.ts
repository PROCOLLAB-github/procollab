/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from "@angular/core";
import { IconComponent } from "@ui/components";
import { Specialization } from "projects/social_platform/src/app/domain/specializations/specialization";

/**
 * Компонент группы специализаций с возможностью сворачивания/разворачивания
 *
 * Функциональность:
 * - Отображает заголовок группы специализаций
 * - Показывает/скрывает список специализаций при клике на заголовок
 * - Позволяет выбирать специализацию из списка
 * - Использует Angular Signals для реактивности
 * - Использует OnPush стратегию для оптимизации производительности
 * - Поддерживает disabled состояние когда открыты другие группы
 *
 * Входные параметры:
 * @Input title - заголовок группы специализаций (обязательный)
 * @Input options - массив специализаций для отображения (обязательный)
 * @Input disabled - флаг отключения взаимодействия с группой
 * @Input hasOpenGroups - флаг наличия открытых групп для адаптации ширины
 *
 * Выходные события:
 * @Output selectOption - событие выбора специализации, передает выбранную специализацию
 * @Output groupToggled - событие переключения видимости группы
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
  @Input() hasOpenGroups = false;
  @Input() disabled = false;
  @Output() selectOption = new EventEmitter<Specialization>();
  @Output() groupToggled = new EventEmitter<boolean>();

  contentVisible = signal(false);

  /**
   * Переключение видимости содержимого группы
   * Теперь учитывает disabled состояние
   */
  toggleContentVisible() {
    if (this.disabled) {
      return;
    }

    this.contentVisible.update(val => !val);
    this.groupToggled.emit(this.contentVisible());
  }

  /**
   * Обработчик выбора специализации
   * Эмитит событие с выбранной специализацией
   * Теперь учитывает disabled состояние
   */
  onSelectOption(opt: Specialization) {
    if (this.disabled) {
      return;
    }

    this.selectOption.emit(opt);
  }
}
