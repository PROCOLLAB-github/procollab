/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-select",
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = "";
  @Input() options: { value: string | number; label: string; id: number }[] = [];

  isOpen = false;

  selectedId?: number;

  constructor() {}

  ngOnInit(): void {}

  writeValue(id: number) {
    this.selectedId = id;
  }

  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  onChange: (value: string | number) => void = () => {};

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  onTouched: () => void = () => {};

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  onUpdate(event: MouseEvent, id: number): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this.selectedId = id;
    this.onChange(this.getValue(id) ?? this.options[0].value);

    this.isOpen = false;
  }

  getLabel(optionId: number): string | undefined {
    return this.options.find(el => el.id === optionId)?.label;
  }

  getValue(optionId: number): string | number | undefined {
    return this.options.find(el => el.id === optionId)?.value;
  }

  getId(label: string): number | undefined {
    return this.options.find(el => el.label === label)?.id;
  }

  onClickOutside() {
    this.isOpen = false;
  }
}
