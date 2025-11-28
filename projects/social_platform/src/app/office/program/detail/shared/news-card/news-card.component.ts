/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ActivatedRoute } from "@angular/router";
import { expandElement } from "@utils/expand-element";
import { FileModel } from "@office/models/file.model";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";
import { forkJoin, noop, Observable, tap } from "rxjs";
import { DayjsPipe, FormControlPipe, ParseLinksPipe, ValidationService } from "projects/core";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { FileUploadItemComponent } from "@ui/components/file-upload-item/file-upload-item.component";
import { ImgCardComponent } from "@office/shared/img-card/img-card.component";
import { FeedNews } from "@office/projects/models/project-news.model";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { ClickOutsideModule } from "ng-click-outside";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";

/**
 * Компонент карточки новости программы
 * Отображает новость с возможностью редактирования, лайков, просмотра файлов
 * Поддерживает загрузку и удаление файлов, расширение текста, копирование ссылки
 */
@Component({
  selector: "app-program-news-card",
  templateUrl: "./news-card.component.html",
  styleUrl: "./news-card.component.scss",
  standalone: true,
  imports: [
    ImgCardComponent,
    FileUploadItemComponent,
    IconComponent,
    FileItemComponent,
    ButtonComponent,
    TextareaComponent,
    ReactiveFormsModule,
    DayjsPipe,
    FormControlPipe,
    TruncatePipe,
    ParseLinksPipe,
    ClickOutsideModule,
  ],
})
export class ProgramNewsCardComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly fileService: FileService,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly cdRef: ChangeDetectorRef
  ) {
    // Создание формы редактирования новости
    this.editForm = this.fb.group({
      text: ["", [Validators.required]], // Текст новости - обязательное поле
    });
  }

  @Input({ required: true }) newsItem!: FeedNews;
  @Input() isOwner!: boolean;
  @Output() delete = new EventEmitter<number>();
  @Output() like = new EventEmitter<number>();
  @Output() edited = new EventEmitter<FeedNews>();

  newsTextExpandable!: boolean;
  readMore = false;
  editMode = false;
  editForm: FormGroup;

  /** Состояние меню действий */
  menuOpen = false;

  /**
   * Закрытие меню действий
   */
  onCloseMenu() {
    this.menuOpen = false;
  }

  // Оригинальные списки (не изменяются во время редактирования)
  imagesViewList: FileModel[] = [];
  filesViewList: FileModel[] = [];

  // Списки для редактирования
  imagesEditList: {
    id: string;
    src: string;
    loading: boolean;
    error: boolean;
    tempFile: File | null;
  }[] = [];

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

  @ViewChild("newsTextEl") newsTextEl?: ElementRef;

  ngOnInit(): void {
    // Установка текущего текста в форму редактирования
    this.editForm.setValue({
      text: this.newsItem.text,
    });

    this.showLikes = this.newsItem.files.map(() => false);

    // Инициализация оригинальных списков
    this.imagesViewList = this.newsItem.files.filter(
      f => f.mimeType.split("/")[0] === "image" || f.mimeType.split("/")[1] === "x-empty"
    );
    this.filesViewList = this.newsItem.files.filter(
      f => f.mimeType.split("/")[0] !== "image" && f.mimeType.split("/")[1] !== "x-empty"
    );

    // Инициализация списков редактирования из оригинальных данных
    this.initEditLists();
  }

  /**
   * Инициализация списков редактирования из текущих данных
   */
  private initEditLists(): void {
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

  ngAfterViewInit(): void {
    const newsTextElem = this.newsTextEl?.nativeElement;
    this.newsTextExpandable = newsTextElem?.clientHeight < newsTextElem?.scrollHeight;

    this.cdRef.detectChanges();
  }

  onCopyLink(): void {
    const programId = this.route.snapshot.params["programId"];

    navigator.clipboard
      .writeText(`https://app.procollab.ru/office/program/${programId}/news/${this.newsItem.id}`)
      .then(() => {
        this.snackbarService.success("Ссылка скопирована");
      });
  }

  /**
   * Отправка отредактированной новости
   */
  onEditSubmit(): void {
    if (!this.validationService.getFormValidation(this.editForm)) return;

    // Собираем только успешно загруженные файлы
    const uploadedImages = this.imagesEditList
      .filter(f => f.src && !f.loading && !f.error)
      .map(f => f.src);

    // Обновляем оригинальные списки на основе успешно загруженных файлов
    this.imagesViewList = this.imagesEditList
      .filter(f => f.src && !f.loading && !f.error)
      .map(f => ({
        link: f.src,
        name: "Image",
        mimeType: "image/jpeg",
        size: 0,
        datetimeUploaded: "",
        extension: "",
        user: 0,
      }));

    this.filesViewList = this.filesEditList
      .filter(f => f.src && !f.loading && !f.error)
      .map(f => ({
        link: f.src,
        name: f.name,
        size: f.size,
        mimeType: f.type,
        datetimeUploaded: "",
        extension: "",
        user: 0,
      }));

    // Обновляем текст в newsItem для отображения
    this.newsItem.text = this.editForm.value.text;

    // Обновляем файлы в newsItem
    this.newsItem.files = [...this.imagesViewList, ...this.filesViewList];

    this.edited.emit({
      ...this.editForm.value,
      files: uploadedImages,
    });

    this.onCloseEditMode();
    this.cdRef.detectChanges();
  }

  /**
   * Закрытие режима редактирования
   */
  onCloseEditMode() {
    this.editMode = false;
    // Восстанавливаем списки редактирования из оригинальных данных
    this.initEditLists();
    // Сбрасываем форму к исходному значению
    this.editForm.setValue({
      text: this.newsItem.text,
    });
  }

  onUploadFile(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

    const observableArray: Observable<any>[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileType = files[i].type.split("/")[0];

      if (fileType === "image") {
        const fileObj: ProgramNewsCardComponent["imagesEditList"][0] = {
          id: nanoid(2),
          src: "",
          loading: true,
          error: false,
          tempFile: files[i],
        };
        this.imagesEditList.push(fileObj);

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
        const fileObj: ProgramNewsCardComponent["filesEditList"][0] = {
          id: nanoid(2),
          loading: true,
          error: "",
          src: "",
          tempFile: files[i],
          name: files[i].name,
          size: files[i].size,
          type: files[i].type,
        };
        this.filesEditList.push(fileObj);

        observableArray.push(
          this.fileService.uploadFile(files[i]).pipe(
            tap(file => {
              fileObj.loading = false;
              fileObj.src = file.url;
              fileObj.tempFile = null;
            })
          )
        );
      }
    }

    forkJoin(observableArray).subscribe(noop);

    // Сбрасываем input для возможности повторной загрузки того же файла
    (event.currentTarget as HTMLInputElement).value = "";
  }

  onDeletePhoto(fId: string) {
    const fileIdx = this.imagesEditList.findIndex(f => f.id === fId);
    if (fileIdx === -1) return;

    if (this.imagesEditList[fileIdx].src) {
      this.imagesEditList[fileIdx].loading = true;
      this.fileService.deleteFile(this.imagesEditList[fileIdx].src).subscribe(() => {
        this.imagesEditList.splice(fileIdx, 1);
      });
    } else {
      this.imagesEditList.splice(fileIdx, 1);
    }
  }

  onDeleteFile(fId: string) {
    const fileIdx = this.filesEditList.findIndex(f => f.id === fId);
    if (fileIdx === -1) return;

    if (this.filesEditList[fileIdx].src) {
      this.filesEditList[fileIdx].loading = true;
      this.fileService.deleteFile(this.filesEditList[fileIdx].src).subscribe(() => {
        this.filesEditList.splice(fileIdx, 1);
      });
    } else {
      this.filesEditList.splice(fileIdx, 1);
    }
  }

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

  showLikes: boolean[] = [];
  lastTouch = 0;

  onTouchImg(_event: TouchEvent, imgIdx: number) {
    if (Date.now() - this.lastTouch < 300) {
      this.like.emit(this.newsItem.id);
      this.showLikes[imgIdx] = true;

      setTimeout(() => {
        this.showLikes[imgIdx] = false;
      }, 1000);
    }

    this.lastTouch = Date.now();
  }

  onExpandNewsText(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readMore = !isExpanded;
  }
}
