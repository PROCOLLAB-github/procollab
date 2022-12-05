/** @format */

import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { fromEvent, Subscription } from "rxjs";

@Component({
  selector: "app-num-slider",
  templateUrl: "./num-slider.component.html",
  styleUrls: ["./num-slider.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumSliderComponent),
      multi: true,
    },
  ],
})
export class NumSliderComponent implements OnInit, OnDestroy {
  constructor() {}

  @Input()
  set appNums(value: number[]) {
    this.nums = value;
    this.value ??= value.sort()[0];
  }

  get appNums(): number[] {
    return this.nums;
  }

  @Input()
  set appValue(value: number | undefined) {
    this.value = value;
  }

  get appValue(): number | undefined {
    return this.value;
  }

  @Output() appValueChange = new EventEmitter<string>();
  @Output() enter = new EventEmitter<void>();

  ngOnInit(): void {
    const mouseupSub = fromEvent(document, "mouseup", { capture: true }).subscribe(() => {
      this.mousePressed = false;
    });
    this.subscriptions$.push(mouseupSub);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  // onInput(event: Event): void {
  //   const value = (event.target as HTMLInputElement).value;
  //   this.onChange(value);
  //   this.appValueChange.emit(value);
  // }

  subscriptions$: Subscription[] = [];

  value?: number = 2;

  nums: number[] = [];
  mousePressed = false;

  onBlur(): void {
    this.onTouch();
  }

  writeValue(value: number): void {
    setTimeout(() => {
      this.value = value;
    });
  }

  onChange: (value: number) => void = () => {};

  registerOnChange(fn: (v: number) => void): void {
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

  onMove(event: MouseEvent) {
    if (!this.mousePressed) return;

    const range = event.currentTarget as HTMLElement;
    const { width: totalWidth, x } = range.getBoundingClientRect();
    const stepIdx = this.getStepIdxFromX(totalWidth, event.clientX - x);
    this.value = this.nums[stepIdx];
  }

  private getStepIdxFromX(totalWidth: number, x: number): number {
    const intervalWidth = totalWidth / (this.nums.length - 1);

    for (let i = 0; i < this.nums.length; i++) {
      const startX = i === 0 ? 0 : i * intervalWidth - intervalWidth / 2 + 1;
      const endX = i === this.nums.length - 1 ? totalWidth : i * intervalWidth + intervalWidth / 2;
      if (startX < x && x < endX) {
        return i;
      }
    }

    return 0;
  }

  onMouseDown() {
    this.mousePressed = true;
  }

  onMouseUp() {
    this.mousePressed = false;
  }
}
