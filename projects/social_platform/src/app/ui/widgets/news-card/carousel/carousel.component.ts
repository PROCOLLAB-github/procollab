/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  input,
  OnInit,
  output,
  Output,
} from "@angular/core";
import { FileModel } from "@domain/file/file.model";
import { IconComponent } from "@uilib";

/** Компонент карусели для просмотра изображений с навигацией и лайками. */
@Component({
  selector: "app-carousel",
  imports: [IconComponent],
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnInit {
  readonly images = input<Array<FileModel | string>>([]);
  /** Полное изображение без обрезки включается только локальным окном чтения новости. */
  readonly fit = input<"cover" | "contain">("cover");
  readonly like = output<number>();

  private readonly cdRef = inject(ChangeDetectorRef);

  currentIndex = 0;
  lastTouch = 0;
  showLike = false;

  ngOnInit(): void {}

  /** Листаем массив из signal; длина самой функции не описывает число изображений. */
  next(): void {
    const count = this.images().length;
    if (count) {
      this.currentIndex = (this.currentIndex + 1) % count;
    }
  }

  /** Переход назад циклический, пустой набор не меняет индекс. */
  prev(): void {
    const count = this.images().length;
    if (count) {
      this.currentIndex = (this.currentIndex - 1 + count) % count;
    }
  }

  onTouchImg(_event: TouchEvent): void {
    const now = Date.now();
    if (now - this.lastTouch < 300) {
      this.like.emit(this.currentIndex);
      this.showLike = true;
      setTimeout(() => {
        this.showLike = false;
        this.cdRef.markForCheck();
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
