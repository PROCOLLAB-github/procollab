/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FileModel } from "@office/models/file.model";

@Component({
  selector: "app-carousel",
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
  standalone: true,
})
export class CarouselComponent implements OnInit {
  @Input() images: FileModel[] = [];
  @Output() like: EventEmitter<number> = new EventEmitter<number>();

  currentIndex: number = 0;
  lastTouch: number = 0;
  showLike: boolean = false;

  ngOnInit(): void {}

  next(): void {
    if (this.images.length) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }
  }

  prev(): void {
    if (this.images.length) {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
  }

  onTouchImg(_event: TouchEvent): void {
    const now = Date.now();
    if (now - this.lastTouch < 300) {
      this.like.emit(this.currentIndex);
      this.showLike = true;
      setTimeout(() => {
        this.showLike = false;
      }, 1000);
    }
    this.lastTouch = now;
  }
}
