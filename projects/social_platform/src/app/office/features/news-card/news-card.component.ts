/** @format */

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FeedNews } from "@office/projects/models/project-news.model";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  DayjsPipe,
  FormControlPipe,
  ParseBreaksPipe,
  ParseLinksPipe,
  ValidationService,
} from "projects/core";
import { FileService } from "@core/services/file.service";
import { nanoid } from "nanoid";
import { expandElement } from "@utils/expand-element";
import { FileModel } from "@models/file.model";
import { forkJoin, noop, Observable, tap } from "rxjs";
import { ButtonComponent, IconComponent } from "@ui/components";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { FileUploadItemComponent } from "@ui/components/file-upload-item/file-upload-item.component";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { ClickOutsideModule } from "ng-click-outside";
import { CarouselComponent } from "@office/shared/carousel/carousel.component";
import { ImgCardComponent } from "@office/shared/img-card/img-card.component";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";

/**
 * Компонент карточки новости
 * Отображает новость с возможностью редактирования, лайков, просмотра файлов
 * Поддерживает загрузку и удаление файлов, расширение текста, копирование ссылки
 */
@Component({
  selector: "app-news-card",
  templateUrl: "./news-card.component.html",
  styleUrl: "./news-card.component.scss",
  standalone: true,
  imports: [
    ClickOutsideModule,
    RouterLink,
    IconComponent,
    TextareaComponent,
    ReactiveFormsModule,
    FileUploadItemComponent,
    FileItemComponent,
    ButtonComponent,
    DayjsPipe,
    FormControlPipe,
    TruncatePipe,
    ParseLinksPipe,
    ParseBreaksPipe,
    CarouselComponent,
    ImgCardComponent,
  ],
})
export class NewsCardComponent implements OnInit {
  /**
   * Конструктор компонента
   * @param snackbarService - сервис для отображения уведомлений
   * @param route - текущий маршрут для получения параметров
   * @param fb - FormBuilder для создания формы редактирования
   * @param validationService - сервис валидации форм
   * @param fileService - сервис для работы с файлами
   * @param cdRef - ChangeDetectorRef для ручного обновления представления
   */
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly fileService: FileService,
    private readonly cdRef: ChangeDetectorRef
  ) {
    // Создание формы редактирования новости
    this.editForm = this.fb.group({
      text: ["", [Validators.required]], // Текст новости - обязательное поле
    });
  }

  /** Данные новости для отображения */
  @Input({ required: true }) feedItem!: FeedNews;
  /** Ссылка на ресурс (профиль или проект) */
  @Input({ required: true }) resourceLink!: (string | number)[];
  /** ID контента (проекта или пользователя) */
  @Input({ required: false }) contentId?: number;
  /** Является ли текущий пользователь владельцем новости */
  @Input() isOwner?: boolean;

  // События компонента
  /** Событие удаления новости */
  @Output() delete = new EventEmitter<number>();
  /** Событие лайка новости */
  @Output() like = new EventEmitter<number>();
  /** Событие редактирования новости */
  @Output() edited = new EventEmitter<FeedNews>();

  /** URL заглушки для аватара */
  placeholderUrl = "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif";

  // Состояние компонента
  /** Можно ли расширить текст новости */
  newsTextExpandable!: boolean;
  /** Показан ли полный текст */
  readMore = false;
  /** Режим редактирования */
  editMode = false;
  /** Форма редактирования */
  editForm: FormGroup;

  /**
   * Инициализация компонента
   * Настраивает форму редактирования и обрабатывает файлы новости
   */
  ngOnInit(): void {
    // Установка текущего текста в форму редактирования
    this.editForm.setValue({
      text: this.feedItem.text,
    });

    // Обработка файлов новости
    const processedFiles = this.feedItem.files.map(file => {
      if (typeof file === "string") {
        // Преобразование строки в объект FileModel
        return {
          link: file,
          name: "Image",
          mimeType: "image/jpeg",
          size: 0,
          datetimeUploaded: "",
          extension: "",
          user: 0,
        } as FileModel;
      }
      return file;
    });

    // Инициализация массива для отображения лайков на изображениях
    this.showLikes = this.feedItem.files.map(() => false);

    // Разделение файлов на изображения и документы
    this.imagesViewList = processedFiles.filter(f => {
      const [type] = (f.mimeType || "").split("/");
      return type === "image" || f.mimeType === "x-empty";
    });

    this.filesViewList = processedFiles.filter(f => {
      const [type] = (f.mimeType || "").split("/");
      return type !== "image" && f.mimeType !== "x-empty";
    });

    // Создание списков для редактирования
    this.imagesEditList = this.imagesViewList.map(file => ({
      src: file.link,
      id: nanoid(),
      error: false,
      loading: false,
      tempFile: null,
    }));

    this.filesEditList = this.filesViewList.map(file => ({
      src: file.link,
      id: nanoid(),
      error: "",
      loading: false,
      name: file.name,
      size: file.size,
      type: file.mimeType,
      tempFile: null,
    }));
  }

  /** Список изображений для просмотра */
  imagesViewList: FileModel[] = [];
  /** Список файлов для просмотра */
  filesViewList: FileModel[] = [];

  /** Ссылка на элемент текста новости */
  @ViewChild("newsTextEl") newsTextEl?: ElementRef;

  /**
   * Инициализация после отрисовки представления
   * Определяет, можно ли расширить текст новости
   */
  ngAfterViewInit(): void {
    const newsTextElem = this.newsTextEl?.nativeElement;
    this.newsTextExpandable = newsTextElem?.clientHeight < newsTextElem?.scrollHeight;
    this.cdRef.detectChanges();
  }

  /**
   * Копирование ссылки на новость в буфер обмена
   */
  onCopyLink(): void {
    const isProject = this.resourceLink[0].toString().includes("projects");
    let fullUrl = "";

    // Формирование URL в зависимости от типа ресурса
    if (isProject) {
      fullUrl = `${location.origin}/office/projects/${this.contentId}/news/${this.feedItem.id}`;
    } else {
      fullUrl = `${location.origin}/office/profile/${this.contentId}/news/${this.feedItem.id}`;
    }

    // Копирование в буфер обмена
    navigator.clipboard.writeText(fullUrl).then(() => {
      this.snackbarService.success("Ссылка скопирована");
    });
  }

  /** Состояние меню действий */
  menuOpen = false;

  /**
   * Закрытие меню действий
   */
  onCloseMenu() {
    this.menuOpen = false;
  }

  /**
   * Отправка отредактированной новости
   */
  onEditSubmit(): void {
    if (!this.validationService.getFormValidation(this.editForm)) return;

    this.edited.emit({
      ...this.editForm.value,
      files: this.imagesEditList.filter(f => f.src).map(f => f.src),
    });
  }

  /**
   * Закрытие режима редактирования
   */
  onCloseEditMode() {
    this.editMode = false;
  }

  /** Список изображений для редактирования */
  imagesEditList: {
    id: string;
    src: string;
    loading: boolean;
    error: boolean;
    tempFile: File | null;
  }[] = [];

  /** Список файлов для редактирования */
  filesEditList: {
    id: string;
    src: string;
    loading: boolean;
    error: string;
    name: string;
    size: number;
    type: string;
    tempFile: File | null;
  }[] = [];

  /**
   * Загрузка файлов при редактировании
   * @param event - событие выбора файлов
   */
  onUploadFile(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

    const observableArray: Observable<any>[] = [];

    // Обработка каждого выбранного файла
    for (let i = 0; i < files.length; i++) {
      const fileType = files[i].type.split("/")[0];

      if (fileType === "image") {
        // Обработка изображений
        const fileObj: NewsCardComponent["imagesEditList"][0] = {
          id: nanoid(2),
          src: "",
          loading: true,
          error: false,
          tempFile: files[0],
        };
        this.imagesEditList.push(fileObj);

        observableArray.push(
          this.fileService.uploadFile(files[i]).pipe(
            tap(file => {
              fileObj.src = file.url;
              fileObj.loading = false;

              // Добавление в список для просмотра
              if (fileObj.tempFile) {
                this.imagesViewList.push({
                  name: fileObj.tempFile.name,
                  size: fileObj.tempFile.size,
                  mimeType: fileObj.tempFile.type,
                  link: fileObj.src,
                  datetimeUploaded: "",
                  extension: "",
                  user: 0,
                });
              }

              fileObj.tempFile = null;
            })
          )
        );
      } else {
        // Обработка документов
        const fileObj: NewsCardComponent["filesEditList"][0] = {
          id: nanoid(2),
          loading: true,
          error: "",
          src: "",
          tempFile: files[0],
          name: "",
          size: 0,
          type: "",
        };
        this.filesEditList.push(fileObj);

        observableArray.push(
          this.fileService.uploadFile(files[i]).pipe(
            tap(file => {
              fileObj.loading = false;
              fileObj.src = file.url;

              // Добавление в список для просмотра
              if (fileObj.tempFile) {
                this.filesViewList.push({
                  name: fileObj.tempFile.name,
                  size: fileObj.tempFile.size,
                  mimeType: fileObj.tempFile.type,
                  link: fileObj.src,
                  datetimeUploaded: "",
                  extension: "",
                  user: 0,
                });
              }
            })
          )
        );
      }
    }

    // Параллельная загрузка всех файлов
    forkJoin(observableArray).subscribe(noop);
  }

  /**
   * Удаление изображения
   * @param fId - идентификатор файла для удаления
   */
  onDeletePhoto(fId: string) {
    const fileIdx = this.imagesEditList.findIndex(f => f.id === fId);

    if (this.imagesEditList[fileIdx].src) {
      this.imagesEditList[fileIdx].loading = true;
      this.fileService.deleteFile(this.imagesEditList[fileIdx].src).subscribe(() => {
        this.imagesEditList.splice(fileIdx, 1);
      });
    } else {
      this.imagesEditList.splice(fileIdx, 1);
    }
  }

  /**
   * Удаление файла
   * @param fId - идентификатор файла для удаления
   */
  onDeleteFile(fId: string) {
    const fileIdx = this.filesEditList.findIndex(f => f.id === fId);

    if (this.filesEditList[fileIdx].src) {
      this.filesEditList[fileIdx].loading = true;
      this.fileService.deleteFile(this.filesEditList[fileIdx].src).subscribe(() => {
        this.filesEditList.splice(fileIdx, 1);
      });
    } else {
      this.filesEditList.splice(fileIdx, 1);
    }
  }

  /**
   * Повторная попытка загрузки файла
   * @param id - идентификатор файла для повторной загрузки
   */
  onRetryUpload(id: string) {
    const fileObj = this.imagesEditList.find(f => f.id === id);
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

  /** Массив для отображения лайков на изображениях */
  showLikes: boolean[] = [];
  /** Время последнего касания для определения двойного тапа */
  lastTouch = 0;

  /**
   * Обработчик касания изображения (для мобильных устройств)
   * Определяет двойной тап для лайка
   * @param _event - событие касания
   * @param imgIdx - индекс изображения
   */
  onTouchImg(_event: TouchEvent, imgIdx: number) {
    if (Date.now() - this.lastTouch < 300) {
      // Двойной тап - ставим лайк
      this.like.emit(this.feedItem.id);
      this.showLikes[imgIdx] = true;

      // Скрытие анимации лайка через секунду
      setTimeout(() => {
        this.showLikes[imgIdx] = false;
      }, 1000);
    }

    this.lastTouch = Date.now();
  }

  /**
   * Обработчик лайка изображения
   * @param index - индекс изображения
   */
  handleLike(index: number): void {
    console.log("Лайк на изображении с индексом: ", index);
  }

  /**
   * Расширение/сворачивание текста новости
   * @param elem - HTML элемент с текстом
   * @param expandedClass - CSS класс для расширенного состояния
   * @param isExpanded - текущее состояние (расширен/свернут)
   */
  onExpandNewsText(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readMore = !isExpanded;
  }
}
