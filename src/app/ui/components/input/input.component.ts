/** @format */

import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from "@angular/core";
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
  constructor() {}

  @Input() placeholder = "";
  @Input() type: "text" | "password" | "email" = "text";
  @Input() error = false;
  @Input() mask = "";

  @Input()
  set appValue(value: string) {
    this.value = value;
  }

  get appValue(): string {
    return this.value;
  }

  @Output() appValueChange = new EventEmitter<string>();

  ngOnInit(): void {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
    this.appValueChange.emit(value);
  }

  onBlur(): void {
    this.onTouch();
  }

  value = "";
  writeValue(value: string): void {
    setTimeout(() => {
      this.value = value;
    });
  }

  onChange: (value: string) => void = () => {};
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  onTouch: () => void = () => {};
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  disabled = false;
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
