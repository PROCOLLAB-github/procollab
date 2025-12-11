/** @format */
import { Component, inject, Input, OnInit } from "@angular/core";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { IconComponent } from "@ui/components";
import { UpperCasePipe } from "@angular/common";
import { FileService } from "projects/core/src/lib/services/file/file.service";
import { FormatedFileSizePipe } from "projects/core/src/lib/pipes/transformers/formatted-file-size.pipe";

/**
 * Компонент для отображения информации о файле.
 * Показывает тип файла, название, размер и предоставляет возможность скачивания.
 *
 * Входящие параметры:
 * - type: MIME-тип файла (по умолчанию "file")
 * - name: название файла
 * - size: размер файла в байтах
 * - link: ссылка для скачивания файла
 *
 * Функциональность:
 * - Отображение иконки файла по типу
 * - Форматированный вывод размера файла
 * - Автоматическое скачивание файла по клику
 */
@Component({
  selector: "app-file-item",
  templateUrl: "./file-item.component.html",
  styleUrl: "./file-item.component.scss",
  standalone: true,
  imports: [IconComponent, FileTypePipe, UpperCasePipe, FormatedFileSizePipe],
})
export class FileItemComponent implements OnInit {
  private readonly fileService = inject(FileService);

  @Input() canDelete = false;

  /** MIME-тип файла */
  @Input() type = "file";

  /** Название файла */
  @Input() name = "";

  /** Размер файла в байтах */
  @Input() size = 0;

  /** Ссылка для скачивания */
  @Input() link = "";

  ngOnInit(): void {}

  /** Функция скачивания файла через создание временной ссылки */
  onDownloadFile(): void {
    const link = document.createElement("a");

    link.setAttribute("href", this.link);
    link.setAttribute("download", this.name);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Удаление файла
   * Удаляет файл с сервера и из списка прикрепленных файлов
   */
  onDeleteFile(): void {
    if (!this.link) return;

    this.fileService.deleteFile(this.link).subscribe(() => {
      this.link = "";
      this.name = "";
    });
  }
}
