/** @format */

import { Component, EventEmitter, Input, type OnInit, Output } from "@angular/core";
import { FileModel } from "@office/models/file.model";
import { IconComponent } from "@uilib";

/**
 * Компонент карусели для просмотра изображений
 *
 * Функциональность:
 * - Отображает изображения в виде карусели с навигацией
 * - Поддерживает навигацию вперед/назад через кнопки
 * - Обработка двойного тапа для лайка изображения
 * - Анимация сердечка при лайке
 * - Поддерживает как объекты FileModel, так и строковые URL
 * - Отображает текущий индекс изображения
 *
 * Входные параметры:
 * @Input images - массив изображений (FileModel или строки URL)
 *
 * Выходные события:
 * @Output like - событие лайка изображения, передает индекс изображения
 *
 * Внутренние свойства:
 * - currentIndex - текущий индекс отображаемого изображения
 * - lastTouch - время последнего касания для определения двойного тапа
 * - showLike - флаг отображения анимации лайка
 */
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

  /**
   * Переход к следующему изображению
   * Использует циклическую навигацию
   */
  next(): void {
    if (this.images.length) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }
  }

  /**
   * Переход к предыдущему изображению
   * Использует циклическую навигацию
   */
  prev(): void {
    if (this.images.length) {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
  }

  /**
   * Обработчик касания изображения
   * Определяет двойной тап и запускает лайк с анимацией
   */
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

  /**
   * Получение URL изображения
   * Обрабатывает как объекты FileModel, так и строки
   */
  getImageUrl(image: FileModel | string): string {
    return typeof image === "string" ? image : image.link;
  }

  /**
   * Получение имени изображения
   * Обрабатывает как объекты FileModel, так и строки
   */
  getImageName(image: FileModel | string): string {
    return typeof image === "string" ? "Image" : image.name || "Image";
  }
}
