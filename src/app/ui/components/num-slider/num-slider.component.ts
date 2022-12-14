/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
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

    setTimeout(() => {
      if (this.pointEl && this.fillEl) {
        this.pointEl.nativeElement.style.left = `${this.getButtonCoordinate()}%`;
        this.fillEl.nativeElement.style.width = `${this.getButtonCoordinate()}%`;
      }
    });
  }

  get appValue(): number | null {
    return this.value;
  }

  @Output() appValueChange = new EventEmitter<number>();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  @ViewChild("pointEl") pointEl?: ElementRef<HTMLElement>;
  @ViewChild("rangeEl") rangeEl?: ElementRef<HTMLElement>;
  @ViewChild("fillEl") fillEl?: ElementRef<HTMLElement>;

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
    const xChange = event.clientX - x;

    if (this.pointEl && xChange > 0 && xChange < totalWidth && this.fillEl) {
      this.pointEl.nativeElement.style.left = `${xChange}px`;
      this.fillEl.nativeElement.style.width = `${xChange}px`;
    }

    if (xChange < 0 && xChange > totalWidth) this.onStopInteraction(event);
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

  private getButtonCoordinate(): number {
    return this.value ? (100 / (this.nums.length - 1)) * this.nums.indexOf(this.value) : 0;
  }

  onStopInteraction(event: MouseEvent) {
    event.stopPropagation();

    this.renderRange();

    this.stopMoving();
  }

  private renderRange() {
    if (!this.pointEl || !this.rangeEl || !this.fillEl) return;
    const { width: rangeWidth, x: rangeX } = this.rangeEl.nativeElement.getBoundingClientRect();
    const { x } = this.pointEl.nativeElement.getBoundingClientRect();
    const stepIdx = this.getStepIdxFromX(rangeWidth, x - rangeX);
    this.value = this.nums[stepIdx];

    this.pointEl.nativeElement.style.left = `${this.getButtonCoordinate()}%`;
    this.fillEl.nativeElement.style.width = `${this.getButtonCoordinate()}%`;
  }

  private stopMoving() {
    this.mousePressed = false;
    this.onChange(this.value ?? 0);
    this.appValueChange.emit(this.value ?? 0);
  }
}
