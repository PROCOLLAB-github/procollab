/** @format */

import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AutosizeModule } from "ngx-autosize";

@Component({
  selector: "app-textarea",
  templateUrl: "./textarea.component.html",
  styleUrl: "./textarea.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [AutosizeModule],
})
export class TextareaComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = "";
  @Input() type: "text" | "password" | "email" = "text";
  @Input() error = false;
  @Input() mask = "";
  @Input() set text(value: string) {
    this.value = value;
  }

  get text(): string {
    return this.value;
  }

  @Output() textChange = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
    this.textChange.emit(value);
  }

  onBlur(): void {
    this.onTouch();
  }

  value = "";

  writeValue(value: string): void {
    this.value = value;
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

  preventEnter(event: Event) {
    event.preventDefault();
  }
}
