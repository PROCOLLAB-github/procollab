/** @format */

import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { noop } from "rxjs";

@Component({
  selector: "app-boolean-criterion",
  templateUrl: "./boolean-criterion.component.html",
  styleUrl: "./boolean-criterion.component.scss",
  standalone: true,
  imports: [IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooleanCriterionComponent),
      multi: true,
    },
  ],
})
export class BooleanCriterionComponent implements ControlValueAccessor {
  @Input() disabled = false;

  isChecked = false;
  onChange: (val: boolean) => void = noop;
  onTouched: () => void = noop;

  writeValue(val: boolean): void {
    this.isChecked = val;
  }

  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.isChecked = target && target.checked;
    this.onChange(this.isChecked);
    this.onTouched();
  }

  onClickLog() {
    this.isChecked = !this.isChecked;
  }
}
