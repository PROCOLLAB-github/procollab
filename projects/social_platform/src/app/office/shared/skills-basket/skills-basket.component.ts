/** @format */

import { CommonModule } from "@angular/common";
import { Component, forwardRef, Input, signal } from "@angular/core";
import { Skill } from "@office/models/skill";
import { IconComponent } from "@ui/components";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { noop } from "rxjs";

/**
 * Компонент корзины навыков
 * Отображает выбранные навыки в виде тегов с возможностью удаления
 * Используется в формах выбора навыков как визуальное представление выбранных элементов
 *
 * Реализует ControlValueAccessor для интеграции с Angular Forms
 * Поддерживает отображение состояния ошибки валидации
 */
@Component({
  selector: "app-skills-basket",
  templateUrl: "./skills-basket.component.html",
  styleUrl: "./skills-basket.component.scss",
  imports: [CommonModule, IconComponent],
  standalone: true,
  providers: [
    {
      // Регистрация как ControlValueAccessor для работы с формами
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SkillsBasketComponent),
      multi: true,
    },
  ],
})
export class SkillsBasketComponent {
  /** Флаг отображения состояния ошибки (красная рамка) */
  @Input() error = false;

  /** Сигнал для хранения массива выбранных навыков */
  value = signal<Skill[]>([]);

  // Методы ControlValueAccessor
  /** Функция обратного вызова для уведомления об изменениях */
  onChange: (val: Skill[]) => void = noop;
  /** Функция обратного вызова для уведомления о касании */
  onTouched: () => void = noop;

  /**
   * Установка значения в компонент (ControlValueAccessor)
   * @param val - массив навыков для отображения в корзине
   */
  writeValue(val: Skill[]): void {
    if (val) {
      this.value.set(val);
    }
  }

  /**
   * Регистрация функции обратного вызова для изменений (ControlValueAccessor)
   * @param fn - функция для вызова при изменении значения
   */
  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  /**
   * Регистрация функции обратного вызова для касания (ControlValueAccessor)
   * @param fn - функция для вызова при касании компонента
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Удаление навыка из корзины
   * Фильтрует массив навыков, исключая навык с указанным ID
   * Уведомляет родительский компонент об изменении через onChange
   * @param id - идентификатор навыка для удаления
   */
  deleteSkill(id: number): void {
    const filtered = this.value().filter(skill => skill.id !== id);

    this.value.set(filtered);
    this.onChange(filtered);
  }
}
