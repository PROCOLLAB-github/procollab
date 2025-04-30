/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FileModel } from "@office/models/file.model";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-carousel",
  imports: [IconComponent],
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
  standalone: true,
})
export class CarouselComponent implements OnInit {
  @Input() images: Array<FileModel | string> = [];
  @Output() like: EventEmitter<number> = new EventEmitter<number>();

  currentIndex = 0;
  lastTouch = 0;
  showLike = false;

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

  getImageUrl(image: FileModel | string): string {
    return typeof image === "string" ? image : image.link;
  }

  getImageName(image: FileModel | string): string {
    return typeof image === "string" ? "Image" : image.name || "Image";
  }
}
