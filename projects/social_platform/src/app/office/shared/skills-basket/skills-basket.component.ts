/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, forwardRef, signal } from "@angular/core";
import { Skill } from "@office/models/skill";
import { IconComponent } from "@ui/components";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { noop } from "rxjs";

@Component({
  selector: "app-skills-basket",
  templateUrl: "./skills-basket.component.html",
  styleUrl: "./skills-basket.component.scss",
  imports: [CommonModule, IconComponent],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SkillsBasketComponent),
      multi: true,
    },
  ],
})
export class SkillsBasketComponent {
  @Input() error = false;

  value = signal<Skill[]>([]);

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
