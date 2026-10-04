/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { University } from "@domain/profile/university.model";
import { UniversityHttpAdapter } from "@infrastructure/adapters/profile/university-http.adapter";
import { catchError, map, of, Subject, switchMap, timer } from "rxjs";

/** Suggestions commit only on selection; writeValue never changes a legacy profile value. */
@Component({
  selector: "app-university-select",
  templateUrl: "./university-select.component.html",
  styleUrl: "./university-select.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UniversitySelectComponent),
      multi: true,
    },
  ],
})
export class UniversitySelectComponent implements ControlValueAccessor {
  readonly error = input(false);
  readonly inputId = input("organizationName");
  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>("nameInput");
  readonly text = signal("");
  readonly custom = signal(false);
  readonly disabled = signal(false);
  readonly open = signal(false);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly universities = signal<University[]>([]);
  readonly total = signal(0);
  readonly activeIndex = signal(-1);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly adapter = inject(UniversityHttpAdapter);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<{ query: string; offset: number; delay: number }>();
  private query = "";
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.requests
      .pipe(
        switchMap(request =>
          timer(request.delay).pipe(
            switchMap(() => this.adapter.search(request.query, request.offset)),
            map(page => ({ request, page })),
            catchError(() => of({ request, page: null })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ request, page }) => {
        this.loading.set(false);
        this.failed.set(!page);
        if (page) {
          this.universities.update(items =>
            request.offset ? [...items, ...page.results] : page.results,
          );
          this.total.set(page.count);
        }
      });
  }

  writeValue(value: string | null): void {
    this.text.set(value ?? "");
    this.custom.set(false);
    this.close();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) this.close();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.text.set(value);
    this.onChange(this.custom() ? value.trim() : "");
    if (!this.custom()) this.search(value, 200);
  }

  onFocus(): void {
    if (!this.custom() && !this.disabled()) this.search(this.text(), 0);
  }

  browse(): void {
    if (this.disabled()) return;
    this.custom.set(false);
    this.inputElement()?.nativeElement.focus();
    this.search("", 0);
  }

  private search(query: string, delay: number): void {
    this.query = query.trim();
    this.open.set(true);
    this.loading.set(true);
    this.failed.set(false);
    this.universities.set([]);
    this.total.set(0);
    this.activeIndex.set(-1);
    this.requests.next({ query: this.query, offset: 0, delay });
  }

  loadMore(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.requests.next({ query: this.query, offset: this.universities().length, delay: 0 });
  }

  select(university: University): void {
    this.text.set(university.name);
    this.onChange(university.name);
    this.onTouched();
    this.close();
  }

  selectOther(): void {
    this.custom.set(true);
    this.onChange(this.text().trim());
    this.onTouched();
    this.close();
    this.inputElement()?.nativeElement.focus();
  }

  onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.close();
      this.onTouched();
    }
  }

  close(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (this.custom()) return;
      event.preventDefault();
      if (!this.open()) this.onFocus();
      const count = this.universities().length + 1; // Includes Other.
      this.activeIndex.update(index => {
        if (index < 0) return event.key === "ArrowDown" ? 0 : count - 1;
        return (index + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
      });
      queueMicrotask(() =>
        this.host.nativeElement
          .querySelector(`#${this.inputId()}-option-${this.activeIndex()}`)
          ?.scrollIntoView({ block: "nearest" }),
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!this.open() || this.activeIndex() < 0) return;
      const university = this.universities()[this.activeIndex()];
      if (university) this.select(university);
      else this.selectOther();
    }
  }
}
