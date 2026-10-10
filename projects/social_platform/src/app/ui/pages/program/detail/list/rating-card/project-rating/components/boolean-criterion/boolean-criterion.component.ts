/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../../../../../../../ui/src/lib/services/desktop-layout.service";

import { ChoiceDirective } from "@uilib";

import { ChangeDetectionStrategy, Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/primitives";
import { noop } from "rxjs";

/** Чекбокс для булевых критериев оценки с интеграцией через ControlValueAccessor. */
@Component({
  selector: "app-boolean-criterion",
  templateUrl: "./boolean-criterion.component.html",
  styleUrl: "./boolean-criterion.component.scss",
  imports: [ChoiceDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooleanCriterionComponent),
      multi: true,
    },
  ],
})
export class BooleanCriterionComponent implements ControlValueAccessor {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

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
