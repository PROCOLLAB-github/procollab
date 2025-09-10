/** @format */

import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ValidationService } from "projects/core";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";
import { forkJoin, noop, Observable, tap } from "rxjs";
import { FileUploadItemComponent } from "@ui/components/file-upload-item/file-upload-item.component";
import { ImgCardComponent } from "../img-card/img-card.component";
import { IconComponent, ButtonComponent, InputComponent } from "@ui/components";
import { AutosizeModule } from "ngx-autosize";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";

/**
 * Компонент формы создания новости
 *
 * Функциональность:
 * - Создание новой новости с текстом и прикрепленными файлами
 * - Загрузка файлов через input или drag&drop, а также вставка из буфера обмена
 * - Разделение файлов на изображения и документы
 * - Предварительный просмотр загруженных файлов
 * - Управление состояниями загрузки и ошибок для каждого файла
 * - Возможность удаления и повторной загрузки файлов
 *
 * Выходные события:
 * @Output addNews - событие добавления новости, передает объект с текстом и массивом URL файлов
 *
 * Внутренние свойства:
 * - messageForm - форма с полем текста новости (обязательное)
 * - imagesList - массив объектов изображений с состояниями загрузки
 * - filesList - массив объектов файлов с состояниями загрузки
 */
@Component({
  selector: "app-news-form",
  templateUrl: "./news-form.component.html",
  styleUrl: "./news-form.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutosizeModule,
    IconComponent,
    ImgCardComponent,
    FileUploadItemComponent,
    ButtonComponent,
    TextareaComponent,
    InputComponent,
  ],
})
export class NewsFormComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly fileService: FileService
  ) {
    this.messageForm = this.fb.group({
      text: ["", [Validators.required]],
    });
  }

  @Output() addNews = new EventEmitter<{ text: string; files: string[] }>();

  ngOnInit(): void {}

  messageForm: FormGroup;

  /**
   * Обработчик отправки формы
   * Валидирует форму и эмитит событие с данными новости
   */
  onSubmit() {
    if (!this.validationService.getFormValidation(this.messageForm)) {
      return;
    }

    this.addNews.emit({
      ...this.messageForm.value,
      files: [...this.imagesList.map(f => f.src), ...this.filesList.map(f => f.src)],
    });
  }

  /**
   * Сброс формы и очистка списков файлов
   */
  onResetForm() {
    this.imagesList = [];
    this.messageForm.reset();
  }

  // Массив изображений с метаданными
  imagesList: {
    id: string;
    src: string;
    loading: boolean;
    error: boolean;
    tempFile: File | null;
  }[] = [];

  // Массив файлов с метаданными
  filesList: {
    id: string;
    loading: boolean;
    error: string;
    src: string;
    tempFile: File;
  }[] = [];

  /**
   * Загрузка файлов на сервер
   * Разделяет файлы на изображения и документы, загружает параллельно
   */
  uploadFiles(files: FileList) {
    const observableArray: Observable<any>[] = [];
    for (let i = 0; i < files.length; i++) {
      const fileType = files[i].type.split("/")[0];

      if (fileType === "image") {
        const fileObj: NewsFormComponent["imagesList"][0] = {
          id: nanoid(2),
          src: "",
          loading: true,
          error: false,
          tempFile: files[0],
        };
        this.imagesList.push(fileObj);
        observableArray.push(
          this.fileService.uploadFile(files[i]).pipe(
            tap(file => {
              fileObj.src = file.url;
              fileObj.loading = false;
              fileObj.tempFile = null;
            })
          )
        );
      } else {
        const fileObj: NewsFormComponent["filesList"][0] = {
          id: nanoid(2),
          loading: true,
          error: "",
          src: "",
          tempFile: files[0],
        };
        this.filesList.push(fileObj);
        observableArray.push(
          this.fileService.uploadFile(files[i]).pipe(
            tap(file => {
              fileObj.loading = false;
              fileObj.src = file.url;
            })
          )
        );
      }
    }

    forkJoin(observableArray).subscribe(noop);
  }

  /**
   * Обработчик выбора файлов через input
   */
  onInputFiles(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

    this.uploadFiles(files);
  }

  /**
   * Обработчик вставки файлов из буфера обмена
   */
  onPaste(event: ClipboardEvent) {
    const files = event.clipboardData?.files;
    if (!files) return;

    this.uploadFiles(files);
  }

  /**
   * Удаление изображения из списка
   * Если файл уже загружен на сервер, удаляет его оттуда
   */
  onDeletePhoto(fId: string) {
    const fileIdx = this.imagesList.findIndex(f => f.id === fId);

    if (this.imagesList[fileIdx].src) {
      this.imagesList[fileIdx].loading = true;
      this.fileService.deleteFile(this.imagesList[fileIdx].src).subscribe(() => {
        this.imagesList.splice(fileIdx, 1);
      });
    } else {
      this.imagesList.splice(fileIdx, 1);
    }
  }

  /**
   * Удаление файла из списка
   * Если файл уже загружен на сервер, удаляет его оттуда
   */
  onDeleteFile(fId: string) {
    const fileIdx = this.filesList.findIndex(f => f.id === fId);

    if (this.filesList[fileIdx].src) {
      this.filesList[fileIdx].loading = true;
      this.fileService.deleteFile(this.imagesList[fileIdx].src).subscribe(() => {
        this.filesList.splice(fileIdx, 1);
      });
    } else {
      this.filesList.splice(fileIdx, 1);
    }
  }

  /**
   * Повторная попытка загрузки изображения
   * Используется при ошибке загрузки
   */
  onRetryUpload(id: string) {
    const fileObj = this.imagesList.find(f => f.id === id);
    if (!fileObj || !fileObj.tempFile) return;

    fileObj.loading = true;
    fileObj.error = false;
    this.fileService.uploadFile(fileObj.tempFile).subscribe({
      next: file => {
        fileObj.src = file.url;
        fileObj.loading = false;
        fileObj.tempFile = null;
      },
      error: () => {
        fileObj.error = true;
        fileObj.loading = false;
      },
    });
  }
}
