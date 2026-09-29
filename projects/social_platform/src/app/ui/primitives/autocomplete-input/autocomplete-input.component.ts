/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Input,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { IconComponent } from "@uilib";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ClickOutsideModule } from "ng-click-outside";
import { debounce, distinctUntilChanged, of, Subject, timer } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { animate, style, transition, trigger } from "@angular/animations";
import { LoaderComponent } from "../loader/loader.component";
import { Skill } from "@domain/skills/skill.model";

@Component({
  selector: "app-autocomplete-input",
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
  @Input({ required: true }) set suggestions(val: T[]) {
    this._suggestions.set(val);
    this.handleSuggestionsChange(val);
  }
  get suggestions(): T[] {
    return this._suggestions();
  }

  readonly fieldToDisplayMode = input<"text" | "chip">("text");
  readonly fieldToDisplay = input.required<keyof T>();
  readonly valueField = input<string>();
  readonly forceSelect = input<boolean>(false);
  readonly clearInputOnSelect = input<boolean>(false);
  readonly delay = input<number>(300);
  readonly placeholder = input<string>("");
  readonly searchIcon = input<string>("search");
  readonly slimVersion = input<boolean>(false);
  readonly error = input<boolean>(false);

  readonly openSkillsFunc = output<void>();
  readonly searchStart = output<string>();
  /** Сразу инвалидирует запрос родителя, не дожидаясь debounce следующего поиска. */
  readonly queryChanged = output<string>();
  readonly optionSelected = output<Skill>();
  readonly inputCleared = output();

  readonly inputElem = viewChild<ElementRef<HTMLInputElement>>("input");

  value = signal(null);
  inputValue = signal("");
  _suggestions = signal<T[]>([]);
  isOpen = signal(false);
  loading = signal(false);
  noResults = signal(false);
  disabled = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private readonly queries = new Subject<string>();
  private activeQuery: string | null = null;

  constructor() {
    this.queries
      .pipe(
        distinctUntilChanged(),
        debounce(val => (val ? timer(this.delay()) : of({}))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(val => {
        if (val) this.handleSearch(val);
      });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (value === this.inputValue()) return;
    this.inputValue.set(value);
    this.invalidateSearch();
    this.queryChanged.emit(value);
    this.queries.next(value);
    if (!value) this.inputCleared.emit();
  }

  onBlur(): void {
    this.onTouch();
  }

  writeValue(value: any): void {
    this.value.set(value?.[this.valueField()!] ?? value);
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

    const newValue = value?.[this.valueField()!] ?? value;

    this.value.set(newValue);
    this.onChange(newValue);
    this.optionSelected.emit(newValue);

    this.handleProgrammaticInputValueChange(newValue);

    this.isOpen.set(false);
  }

  onClearValue(event: Event): void {
    event.stopPropagation();
    this.resetSearch();
    this.value.set(null);
    this.onChange(null);
    this.inputCleared.emit();
  }

  onClickOutside(): void {
    const value = this.findExistingSuggestion(this.suggestions);

    if (this.forceSelect() && this.isOpen() && value) {
      const newValue = value?.[this.valueField()!] ?? value;

      this.handleProgrammaticInputValueChange(newValue);
      this.value.set(newValue);
      this.onChange(newValue);
    } else if (this.forceSelect() && this.isOpen() && !value) {
      this.resetSearch();
      this.value.set(null);
      this.onChange(null);
    }

    this.invalidateSearch();
    this.queries.next("");
    this.queryChanged.emit("");
  }

  handleSearch(query: string): void {
    if (!query) {
      this.isOpen.set(false);
      this.inputCleared.emit();
      return;
    }

    this.activeQuery = query;
    this.loading.set(true);
    this.searchStart.emit(query);
  }

  resetSearch(): void {
    this.inputValue.set("");
    this.invalidateSearch();
    // Программный сброс участвует в distinctUntilChanged, но не очищает CVA-значение.
    this.queries.next("");
    this.queryChanged.emit("");
  }

  handleSuggestionsChange(suggestions: any[]): void {
    if (!this.activeQuery || this.activeQuery !== this.inputValue().trim()) return;
    this.noResults.set(!suggestions?.length);
    this.isOpen.set(true);
    this.loading.set(false);
  }

  private invalidateSearch(): void {
    this.activeQuery = null;
    this.isOpen.set(false);
    this.loading.set(false);
    this.noResults.set(false);
  }

  handleProgrammaticInputValueChange(appValue: any): void {
    this.resetSearch();
    if (this.fieldToDisplayMode() !== "chip" && !this.clearInputOnSelect()) {
      this.inputValue.set(appValue?.[this.fieldToDisplay()] ?? appValue ?? "");
    }
  }

  findExistingSuggestion(suggestions: typeof this.suggestions): any {
    if (!this.fieldToDisplay) {
      return suggestions.find(s => String(s).toLowerCase() === this.inputValue().toLowerCase());
    }
    return suggestions.find(
      s => String(s[this.fieldToDisplay()]).toLowerCase() === this.inputValue().toLocaleLowerCase(),
    );
  }
}
