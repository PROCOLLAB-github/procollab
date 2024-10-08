/** @format */

import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";

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
  standalone: true,
  imports: [ClickOutsideModule, IconComponent],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() placeholder = "";
  @Input({ required: true }) options: {
    value: string | number | null;
    label: string;
    id: number | null;
  }[] = [];

  isOpen = false;

  selectedId?: number | null;

  highlightedIndex = -1;

  constructor(private readonly renderer: Renderer2) {}

  @ViewChild("dropdown") dropdown!: ElementRef<HTMLUListElement>;

  @HostListener("document:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen || this.disabled) {
      return;
    }

    event.preventDefault();

    const i = this.highlightedIndex;

    if (event.code === "ArrowUp") {
      if (i < 0) this.highlightedIndex = 0;
      if (i > 0) this.highlightedIndex--;
    }
    if (event.code === "ArrowDown") {
      if (i < this.options.length - 1) {
        this.highlightedIndex++;
      }
    }
    if (event.code === "Enter") {
      if (i >= 0) {
        const id = this.options[this.highlightedIndex].id;
        if (id !== null) {
          this.onUpdate(event, id);
        } else {
          this.onUpdate(event, null as number | null);
        }
      }
    }
    if (event.code === "Escape") {
      this.hideDropdown();
    }

    if (this.isOpen) {
      setTimeout(() => this.trackHighlightScroll());
    }
  }

  trackHighlightScroll(): void {
    const ddElem = this.dropdown.nativeElement;

    const highlightedElem = ddElem.children[this.highlightedIndex];

    const ddBox = ddElem.getBoundingClientRect();
    const optBox = highlightedElem.getBoundingClientRect();

    if (optBox.bottom > ddBox.bottom) {
      const scrollAmount = optBox.bottom - ddBox.bottom + ddElem.scrollTop;
      this.renderer.setProperty(ddElem, "scrollTop", scrollAmount);
    } else if (optBox.top < ddBox.top) {
      const scrollAmount = optBox.top - ddBox.top + ddElem.scrollTop;
      this.renderer.setProperty(ddElem, "scrollTop", scrollAmount);
    }
  }

  writeValue(id: number) {
    if (id === 0) {
      this.selectedId = 0;
      this.onChange(0);
    } else {
      this.selectedId = id;
    }
  }

  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  onChange: (value: string | number | null) => void = () => {};

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  onTouched: () => void = () => {};

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  onUpdate(event: Event, id: number | null): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this.selectedId = id;
    if (id === null) {
      this.onChange(null);
    } else if (id === 0) {
      // handle the "Без тега" option
      this.onChange(0);
    } else {
      this.onChange(id);
    }

    this.hideDropdown();
  }

  getLabel(optionId: number): string | undefined {
    return this.options.find(el => el.id === optionId)?.label;
  }

  getValue(optionId: number | null): string | number | null | undefined {
    if (optionId === null) {
      return null;
    }
    return this.options.find(el => el.id === optionId)?.value;
  }

  getId(label: string): number | null | undefined {
    return this.options.find(el => el.label === label)?.id;
  }

  hideDropdown() {
    this.isOpen = false;
    this.highlightedIndex = -1;
  }

  onClickOutside() {
    this.hideDropdown();
  }
}
