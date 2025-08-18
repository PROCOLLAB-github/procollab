/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { LoaderComponent } from "../loader/loader.component";
import { IconComponent } from "@ui/components";
import { UpperCasePipe } from "@angular/common";
import { FormatedFileSizePipe } from "@core/pipes/formatted-file-size.pipe";

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
  standalone: true,
  imports: [IconComponent, LoaderComponent, UpperCasePipe, FileTypePipe, FormatedFileSizePipe],
})
export class FileUploadItemComponent implements OnInit {
  constructor() {}

  /** MIME-тип файла */
  @Input() type = "file";

  /** Имя файла */
  @Input() name = "";

  /** Размер файла в байтах */
  @Input() size = 0;

  /** Ссылка на файл */
  @Input() link = "";

  /** Состояние загрузки */
  @Input() loading = false;

  /** Текст ошибки */
  @Input() error = "";

  /** Событие удаления файла */
  @Output() delete = new EventEmitter<void>();

  /** Событие повторной попытки загрузки */
  @Output() retry = new EventEmitter<void>();

  ngOnInit(): void {}
}
