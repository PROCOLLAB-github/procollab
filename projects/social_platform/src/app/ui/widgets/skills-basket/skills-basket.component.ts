/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  Input,
  signal,
} from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { noop } from "rxjs";
import { Skill } from "@domain/skills/skill.model";

/** Компонент корзины навыков с ControlValueAccessor для форм. */
@Component({
  selector: "app-skills-basket",
  templateUrl: "./skills-basket.component.html",
  styleUrl: "./skills-basket.component.scss",
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  readonly error = input<boolean>(false);

  value = signal<Skill[]>([]);

  // Методы ControlValueAccessor
  onChange: (val: Skill[]) => void = noop;
  onTouched: () => void = noop;

  writeValue(val: Skill[]): void {
    if (val) {
      this.value.set(val);
    }
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  deleteSkill(id: number): void {
    const filtered = this.value().filter(skill => skill.id !== id);

    this.value.set(filtered);
    this.onChange(filtered);
  }
}
