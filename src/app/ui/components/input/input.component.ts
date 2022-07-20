/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = "";

  constructor() {}

  ngOnInit(): void {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
  }

  value = "";
  writeValue(value: string): void {
    this.value = value;
  }

  onChange: (value: string) => void = () => {};
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouch: () => void = () => {};
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  disabled = false;
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
