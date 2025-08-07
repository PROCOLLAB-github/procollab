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
import { Skill } from "@office/models/skill";

/**
 * Компонент группы навыков с возможностью множественного выбора
 *
 * Функциональность:
 * - Отображает заголовок группы навыков
 * - Показывает/скрывает список навыков при клике на заголовок
 * - Поддерживает множественный выбор навыков с чекбоксами
 * - Синхронизирует состояние выбранных навыков с внешним состоянием
 * - Использует Angular Signals для реактивности
 * - Использует OnPush стратегию для оптимизации производительности
 *
 * Входные параметры:
 * @Input options - массив доступных навыков (обязательный)
 * @Input selected - массив выбранных навыков (обязательный)
 * @Input title - заголовок группы навыков (обязательный)
 *
 * Выходные события:
 * @Output optionToggled - событие переключения навыка, передает навык который был включен/выключен
 *
 * Внутренние свойства:
 * - _options - сигнал с массивом навыков и их состоянием выбора
 * - _selected - сигнал с массивом выбранных навыков
 * - contentVisible - сигнал видимости содержимого группы
 */
@Component({
  selector: "app-skills-group",
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: "./skills-group.component.html",
  styleUrl: "./skills-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsGroupComponent {
  /**
   * Сеттер для опций навыков
   * Обновляет внутренний сигнал с массивом навыков
   */
  @Input({ required: true }) set options(value: Skill[]) {
    this._options.set(value);
  }

  get options(): (Skill & { checked?: boolean })[] {
    return this._options();
  }

  /**
   * Сеттер для выбранных навыков
   * Обновляет состояние выбора для каждого навыка в списке опций
   */
  @Input({ required: true }) set selected(value: Skill[]) {
    this._selected.set(value);

    const options = this.options.map(opt => {
      return { ...opt, checked: value.some(skill => skill.id === opt.id) };
    });

    this._options.set(options);
  }

  get selected(): Skill[] {
    return this._selected();
  }

  @Input({ required: true }) title!: string;
  @Output() optionToggled = new EventEmitter<Skill>();

  _options = signal<(Skill & { checked?: boolean })[]>([]);
  _selected = signal<Skill[]>([]);
  contentVisible = signal(false);

  /**
   * Переключение видимости содержимого группы
   */
  toggleContentVisible(): void {
    this.contentVisible.update(visible => !visible);
  }
}
