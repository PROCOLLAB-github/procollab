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
import { Subscription } from "rxjs";

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
  }

  get appNums(): number[] {
    return this.nums;
  }

  @Input()
  set appValue(value: number | null) {
    this.value = !value || isNaN(value) ? this.nums.sort()[0] : value;
  }

  get appValue(): number | null {
    return this.value;
  }

  @Output() appValueChange = new EventEmitter<number>();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];

  value: number | null = null;

  nums: number[] = [];
  mousePressed = false;

  onBlur(): void {
    this.onTouch();
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
    const intervalWidth = parseInt((totalWidth / (this.nums.length - 1)).toFixed());

    for (let i = 0; i < this.nums.length; i++) {
      const halfInterval = parseInt((intervalWidth / 2).toFixed());
      const startX = i === 0 ? 0 : i * intervalWidth - halfInterval;
      const endX = i === this.nums.length - 1 ? totalWidth : i * intervalWidth + halfInterval;

      if (startX < x && x < endX) {
        return i;
      }
    }

    return 0;
  }

  onStartInteraction() {
    this.mousePressed = true;
  }

  onStopInteraction(event: Event) {
    event.stopPropagation();

    this.stopMoving();
  }

  private stopMoving() {
    this.mousePressed = false;
    this.onChange(this.value ?? 0);
    this.appValueChange.emit(this.value ?? 0);
  }
}
