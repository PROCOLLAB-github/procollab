/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "[appIcon]",
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
  standalone: true,
})
export class IconComponent implements OnInit {
  @Input()
  set appSquare(square: string) {
    this.square = square;

    !this.viewBox && (this.viewBox = `0 0 ${square} ${square}`);
  }

  get appSquare(): string {
    return this.square ?? "";
  }

  @Input()
  set appViewBox(viewBox: string) {
    this.viewBox = viewBox;
  }

  get appViewBox(): string {
    return this.viewBox ?? "0 0 0 0";
  }

  @Input()
  set appWidth(width: string) {
    this.width = width;

    if (this.viewBox) {
      const viewbox = this.viewBoxInfo(this.viewBox);
      viewbox[2] = width;
      !this.viewBox && (this.viewBox = viewbox.join(" "));
    }
  }

  get appWidth(): string {
    return this.width ?? "";
  }

  @Input()
  set appHeight(height: string) {
    this.height = height;

    if (this.viewBox) {
      const viewbox = this.viewBoxInfo(this.viewBox);
      viewbox[3] = height;
      !this.viewBox && (this.viewBox = viewbox.join(" "));
    }
  }

  get appHeight(): string {
    return this.height ?? "";
  }

  @Input({ required: true }) icon!: string;

  square?: string;
  viewBox?: string;

  width?: string;
  height?: string;

  ngOnInit(): void {}

  viewBoxInfo(viewBox: string): string[] {
    return viewBox.split(" ");
  }
}
