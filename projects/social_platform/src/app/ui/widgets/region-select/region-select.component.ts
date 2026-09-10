/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  filterRussianRegions,
  findCanonicalRussianRegion,
} from "@core/consts/lists/russian-regions-list.const";
import { IconComponent } from "@ui/primitives/icon/icon.component";

@Component({
  selector: "app-region-select",
  imports: [CommonModule, IconComponent],
  templateUrl: "./region-select.component.html",
  styleUrl: "./region-select.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RegionSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionSelectComponent implements ControlValueAccessor {
  readonly id = input("region");
  readonly placeholder = input("Выберите регион");
  readonly ariaLabel = input("Регион проекта");
  readonly error = input(false);

  protected readonly query = signal("");
  protected readonly selectedValue = signal("");
  protected readonly legacyValue = signal<string | null>(null);
  protected readonly options = signal<readonly string[]>(filterRussianRegions(""));
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(0);
  protected readonly disabled = signal(false);

  private readonly elementRef: ElementRef<HTMLElement>;

  constructor(elementRef: ElementRef<HTMLElement>) {
    this.elementRef = elementRef;
  }

  protected onFocus(): void {
    if (this.disabled()) return;
    this.updateOptions(this.query());
    this.open.set(true);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.clearCommittedValueWhenSearchChanges(value);
    this.query.set(value);
    this.updateOptions(value);
    this.open.set(true);
  }

  protected selectRegion(region: string): void {
    this.selectedValue.set(region);
    this.query.set(region);
    this.legacyValue.set(null);
    this.open.set(false);
    this.onChange(region);
    this.onTouched();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.selectedValue.set("");
    this.query.set("");
    this.legacyValue.set(null);
    this.updateOptions("");
    this.open.set(true);
    this.onChange("");
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.options();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.open.set(true);
      this.activeIndex.update(index => Math.min(index + 1, Math.max(options.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.activeIndex.update(index => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && this.open() && options.length) {
      event.preventDefault();
      this.selectRegion(options[this.activeIndex()]);
    } else if (event.key === "Escape") {
      this.open.set(false);
      this.restoreSelectedDisplayValue();
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && this.elementRef.nativeElement.contains(nextTarget)) return;

    this.open.set(false);
    this.restoreSelectedDisplayValue();
    this.onTouched();
  }

  writeValue(value: string | null): void {
    const trimmed = typeof value === "string" ? value.trim() : "";
    const canonical = findCanonicalRussianRegion(trimmed);

    this.selectedValue.set(canonical ?? "");
    this.query.set(canonical ?? trimmed);
    this.legacyValue.set(trimmed && !canonical ? trimmed : null);
    this.updateOptions("");
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private updateOptions(query: string): void {
    this.options.set(filterRussianRegions(query));
    this.activeIndex.set(0);
  }

  private restoreSelectedDisplayValue(): void {
    this.query.set(this.selectedValue() || this.legacyValue() || "");
    this.updateOptions("");
  }

  private clearCommittedValueWhenSearchChanges(query: string): void {
    const selected = this.selectedValue();
    const legacy = this.legacyValue();
    const queryMatchesSelected = selected && findCanonicalRussianRegion(query) === selected;
    const queryMatchesLegacy = legacy && query === legacy;

    if ((!selected && !legacy) || queryMatchesSelected || queryMatchesLegacy) return;

    this.selectedValue.set("");
    this.legacyValue.set(null);
    this.onChange("");
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
}
