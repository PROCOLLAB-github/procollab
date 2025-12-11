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
import { Skill } from "../../../domain/skills/skill";

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
 * - Поддерживает disabled состояние когда открыты другие группы
 *
 * Входные параметры:
 * @Input options - массив доступных навыков (обязательный)
 * @Input selected - массив выбранных навыков (обязательный)
 * @Input title - заголовок группы навыков (обязательный)
 * @Input disabled - флаг отключения взаимодействия с группой
 *
 * Выходные события:
 * @Output optionToggled - событие переключения навыка, передает навык который был включен/выключен
 * @Output groupToggled - событие переключения видимости группы
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
  @Input() hasOpenGroups = false;
  @Input() disabled = false;
  @Output() groupToggled = new EventEmitter<boolean>();
  @Output() optionToggled = new EventEmitter<Skill>();

  _options = signal<(Skill & { checked?: boolean })[]>([]);
  _selected = signal<Skill[]>([]);
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
   * Обработка клика по опции навыка
   * Теперь учитывает disabled состояние
   */
  onOptionClick(opt: Skill) {
    if (this.disabled) {
      return;
    }

    this.optionToggled.emit(opt);
  }
}
