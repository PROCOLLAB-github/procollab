/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { LoaderComponent } from "../loader/loader.component";
import { NgIf, UpperCasePipe } from "@angular/common";
import { FormatedFileSizePipe } from "@corelib";
import { IconComponent } from "../icon/icon.component";

/**
 * Компонент для отображения элемента загружаемого файла.
 * Показывает информацию о файле, состояние загрузки и предоставляет действия для управления.
 *
 * Входящие параметры:
 * - type: MIME-тип файла (по умолчанию "file")
 * - name: имя файла
 * - size: размер файла в байтах
 * - link: ссылка на файл
 * - loading: состояние загрузки файла
 * - error: текст ошибки загрузки
 *
 * События:
 * - delete: событие удаления файла
 * - retry: событие повторной попытки загрузки
 */
@Component({
  selector: "app-file-upload-item",
  templateUrl: "./file-upload-item.component.html",
  styleUrl: "./file-upload-item.component.scss",
  imports: [
    IconComponent,
    LoaderComponent,
    NgIf,
    UpperCasePipe,
    FileTypePipe,
    FormatedFileSizePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadItemComponent {
  /** MIME-тип файла */
  type = input("file");

  /** Имя файла */
  name = input("");

  /** Размер файла в байтах */
  size = input(0);

  /** Ссылка на файл */
  link = input("");

  /** Состояние загрузки */
  loading = input(false);

  /** Текст ошибки */
  error = input("");

  /** Событие удаления файла */
  delete = output<void>();

  /** Событие повторной попытки загрузки */
  retry = output<void>();
}
