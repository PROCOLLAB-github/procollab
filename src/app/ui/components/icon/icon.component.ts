/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-icon",
  templateUrl: "./icon.component.html",
  styleUrls: ["./icon.component.scss"],
})
export class IconComponent implements OnInit {
  @Input()
  set appSquare(square: string) {
    this.square = square;

    !this.viewBox && (this.viewBox = `0 0 ${square} ${square}`);
  }

  get appSquare(): string {
    return this.square;
  }

  @Input()
  set appViewBox(viewBox: string) {
    this.viewBox = viewBox;
  }

  get appViewBox(): string {
    return this.viewBox;
  }

  @Input()
  set appWidth(width: string) {
    this.width = width;

    !this.viewBox && (this.viewBox = `0 0 ${width} 0`);
  }

  get appWidth(): string {
    return this.width;
  }

  @Input()
  set appHeight(height: string) {
    this.height = height;

    !this.viewBox && (this.viewBox = `0 0 0 ${height}`);
  }

  get appHeight(): string {
    return this.height;
  }

  @Input() icon!: string;

  square!: string;
  viewBox!: string;

  width!: string;
  height!: string;

  ngOnInit(): void {}
}
