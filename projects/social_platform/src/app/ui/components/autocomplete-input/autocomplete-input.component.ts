/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  forwardRef,
  signal,
} from "@angular/core";
import { IconComponent } from "@uilib";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ClickOutsideModule } from "ng-click-outside";
import { Subscription, debounce, distinctUntilChanged, fromEvent, map, of, timer } from "rxjs";
import { animate, style, transition, trigger } from "@angular/animations";
import { LoaderComponent } from "@ui/components/loader/loader.component";

@Component({
  selector: "app-autocomplete-input",
  standalone: true,
  imports: [CommonModule, IconComponent, ClickOutsideModule, LoaderComponent],
  templateUrl: "./autocomplete-input.component.html",
  styleUrl: "./autocomplete-input.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoCompleteInputComponent),
      multi: true,
    },
  ],
  animations: [
    trigger("dropdownAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scaleY(0.8)" }),
        animate(".12s cubic-bezier(0, 0, 0.2, 1)"),
      ]),
      transition(":leave", [animate(".1s linear", style({ opacity: 0 }))]),
    ]),
  ],
})
export class AutoCompleteInputComponent<T> {
  @Input({ required: true }) get suggestions(): T[] {
    return this._suggestions();
  }

  set suggestions(val: T[]) {
    this._suggestions.set(val);
    this.handleSuggestionsChange(val);
  }

  @Input() fieldToDisplayMode: "text" | "chip" = "text";

  @Input() fieldToDisplay!: keyof T;

  @Input() valueField!: string;

  @Input() forceSelect = false;

  @Input() clearInputOnSelect = false;

  @Input() delay = 300;

  @Input() placeholder = "";

  @Input() searchIcon = "search";

  @Input() slimVersion = false;

  @Input() error = false;

  @Output() searchStart = new EventEmitter<string>();

  @Output() optionSelected = new EventEmitter();

  @Output() inputCleared = new EventEmitter();

  @ViewChild("input") inputElem!: ElementRef;

  value = signal(null);

  inputValue = signal("");

  _suggestions = signal<T[]>([]);

  isOpen = signal(false);

  loading = signal(false);

  noResults = signal(false);

  disabled = signal(false);

  subscriptions$ = signal<Subscription[]>([]);

  constructor(private readonly cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const input$ = fromEvent<Event>(this.inputElem.nativeElement, "input")
      .pipe(
        map(e => (e.target as HTMLInputElement).value.trim()),
        debounce(val => (val ? timer(this.delay) : of({}))),
        distinctUntilChanged()
      )
      .subscribe(val => this.handleSearch(val));

    this.subscriptions$().push(input$);
  }

  ngOnInit(): void {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.inputValue.set(value);
  }

  onBlur(): void {
    this.onTouch();
  }

  writeValue(value: any): void {
    this.value.set(value?.[this.valueField] ?? value);

    this.handleProgrammaticInputValueChange(value);
  }

  onChange: (value: any) => void = () => {};

  registerOnChange(fn: (v: any) => void): void {
    this.onChange = fn;
  }

  onTouch: () => void = () => {};

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onEnter(event: Event): void {
    event.preventDefault();
  }

  onUpdate(event: Event, value: any): void {
    event.stopPropagation();

    const newValue = value?.[this.valueField] ?? value;

    this.value.set(newValue);
    this.onChange(newValue);
    this.optionSelected.emit(newValue);

    this.handleProgrammaticInputValueChange(newValue);

    this.isOpen.set(false);
  }

  onClearValue(event: Event): void {
    event.stopPropagation();
    this.inputValue.set("");
    this.value.set(null);
    this.onChange(null);
  }

  onClickOutside(): void {
    const value = this.findExistingSuggestion(this.suggestions);

    if (this.forceSelect && this.isOpen() && value) {
      const newValue = value?.[this.valueField] ?? value;

      this.handleProgrammaticInputValueChange(newValue);
      this.value.set(newValue);
      this.onChange(newValue);
    } else if (this.forceSelect && this.isOpen() && !value) {
      this.inputValue.set("");
      this.value.set(null);
      this.onChange(null);
    }

    this.isOpen.set(false);
  }

  handleSearch(query: string): void {
    if (!query) {
      this.isOpen.set(false);
      this.cdRef.markForCheck();
      this.inputCleared.emit();
      return;
    }

    this.loading.set(true);

    this.searchStart.emit(query);
  }

  handlePaste(event: ClipboardEvent): void {
    const query = event.clipboardData?.getData("text");

    if (query) {
      this.handleSearch(query.trim());
    }
  }

  handleSuggestionsChange(suggestions: any[]): void {
    if (!suggestions?.length && this.loading()) {
      this.noResults.set(true);
      this.isOpen.set(true);
    }

    if (this.suggestions?.length) {
      this.noResults.set(false);
      this.isOpen.set(true);
    }

    this.loading.set(false);
  }

  handleProgrammaticInputValueChange(appValue: any): void {
    if (this.fieldToDisplayMode === "chip" || this.clearInputOnSelect) {
      this.inputValue.set("");
    } else {
      this.inputValue.set(appValue?.[this.fieldToDisplay] ?? appValue);
    }
  }

  findExistingSuggestion(suggestions: typeof this.suggestions): any {
    if (!this.fieldToDisplay) {
      return suggestions.find(s => String(s).toLowerCase() === this.inputValue().toLowerCase());
    }
    return suggestions.find(
      s => String(s[this.fieldToDisplay]).toLowerCase() === this.inputValue().toLocaleLowerCase()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }
}
