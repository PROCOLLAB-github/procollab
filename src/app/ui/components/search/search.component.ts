/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
})
export class SearchComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = "";
  @Input() type: "text" | "password" | "email" = "text";
  @Input() error = false;
  @Input() mask = "";
  @Input() openable = true;

  @Input()
  set appValue(value: string) {
    this.value = value;
  }

  get appValue(): string {
    return this.value;
  }

  @Output() appValueChange = new EventEmitter<string>();
  @Output() enter = new EventEmitter<void>();

  ngOnInit(): void {
    this.open = !this.openable;
  }

  @ViewChild("inputEl") inputEl?: ElementRef<HTMLInputElement>;
  open = false;

  onSwitchSearch(value: boolean): void {
    if (this.openable) this.open = value;

    if (value) {
      setTimeout(() => {
        this.inputEl?.nativeElement.focus();
      });
    }
  }

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

  stopPropagation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onClickOutside(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.onSwitchSearch(false);
  }
}
