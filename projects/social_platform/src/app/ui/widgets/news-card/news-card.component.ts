/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  signal,
  ViewChild,
} from "@angular/core";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  DayjsPipe,
  FormControlPipe,
  LoggerService,
  ParseBreaksPipe,
  ParseLinksPipe,
  ValidationService,
  TruncatePipe,
} from "@corelib";
import { FileService } from "@core/lib/services/file/file.service";
import { nanoid } from "nanoid";
import { ClickOutsideModule } from "ng-click-outside";
import { CarouselComponent } from "./carousel/carousel.component";
import { ImgCardComponent } from "@ui/primitives/img-card/img-card.component";
import { FeedNews } from "@domain/news/project-news.model";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { FileUploadItemComponent } from "@ui/primitives/file-upload-item/file-upload-item.component";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { FileModel } from "@domain/file/file.model";
import { catchError, forkJoin, noop, Observable, of, take, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ExpandService } from "@api/expand/expand.service";

/** Виджет карточки новости: отображение, лайк, режим редактирования. */
@Component({
  selector: "app-news-card",
  templateUrl: "./news-card.component.html",
  styleUrl: "./news-card.component.scss",
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExpandService],
})
export class NewsCardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly expandService = inject(ExpandService);

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly fileService: FileService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly loggerService: LoggerService
  ) {
    this.editForm = this.fb.group({
      text: ["", [Validators.required]],
    });
  }

  readonly feedItem = input.required<FeedNews>();
  readonly resourceLink = input.required<(string | number)[]>();
  readonly contentId = input<number | undefined>();
  readonly isOwner = input<boolean | undefined>();

  @Output() delete = new EventEmitter<number>();
  @Output() like = new EventEmitter<number>();
  @Output() edited = new EventEmitter<FeedNews>();

  placeholderUrl = "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif";

  editMode = false;
  editForm: FormGroup;

  private profileId = signal(0);

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
    this.editForm.setValue({
      text: this.feedItem().text,
    });

    const processedFiles = this.feedItem().files.map(file => {
      if (typeof file === "string") {
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

    this.showLikes = this.feedItem().files.map(() => false);

    this.imagesViewList = processedFiles.filter(f => {
      const [type] = (f.mimeType || "").split("/");
      return type === "image" || f.mimeType === "x-empty";
    });

    this.filesViewList = processedFiles.filter(f => {
      const [type] = (f.mimeType || "").split("/");
      return type !== "image" && f.mimeType !== "x-empty";
    });

    this.route.params.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: q => {
        this.profileId.set(q["id"]);
        this.cdRef.markForCheck();
      },
    });

    this.initEditLists();
  }

  ngOnDestroy(): void {}

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
    setTimeout(() => {
      this.expandService.checkExpandable("description", true, this.newsTextEl);
      this.cdRef.markForCheck();
    });
  }

  onCopyLink(): void {
    const isProject = this.resourceLink()[0].toString().includes("projects");
    const isProfile = this.resourceLink()[0].toString().includes("profile");
    let fullUrl = "";

    if (isProject) {
      fullUrl = `${location.origin}/office/projects/${this.contentId()}/news/${this.feedItem().id}`;
    } else {
      fullUrl = `${location.origin}/office/profile/${this.profileId() || this.contentId()}/news/${
        this.feedItem().id
      }`;
    }

    navigator.clipboard.writeText(fullUrl).then(() => {
      this.snackbarService.success("Ссылка скопирована");
    });
  }

  menuOpen = false;

  onCloseMenu() {
    this.menuOpen = false;
  }

  onEditSubmit(): void {
    if (!this.validationService.getFormValidation(this.editForm)) return;

    const uploadedImages = this.imagesEditList
      .filter(f => f.src && !f.loading && !f.error)
      .map(f => f.src);

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

    this.feedItem().text = this.editForm.value.text;

    this.feedItem().files = [...this.imagesViewList, ...this.filesViewList];

    this.edited.emit({
      ...this.editForm.value,
      files: uploadedImages,
    });

    this.cdRef.detectChanges();
    this.onCloseEditMode();
  }

  onCloseEditMode() {
    this.editMode = false;

    this.initEditLists();

    this.editForm.setValue({
      text: this.feedItem().text,
    });
  }

  onUploadFile(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

    const observableArray: Observable<any>[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileType = files[i].type.split("/")[0];

      if (fileType === "image") {
        const fileObj: NewsCardComponent["imagesEditList"][0] = {
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
            }),
            catchError(() => {
              fileObj.loading = false;
              fileObj.error = true;
              return of(null);
            })
          )
        );
      } else {
        const fileObj: NewsCardComponent["filesEditList"][0] = {
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
            }),
            catchError(() => {
              fileObj.loading = false;
              fileObj.error = "Ошибка загрузки";
              return of(null);
            })
          )
        );
      }
    }

    forkJoin(observableArray).subscribe(noop);

    (event.currentTarget as HTMLInputElement).value = "";
  }

  onDeletePhoto(fId: string) {
    const fileIdx = this.imagesEditList.findIndex(f => f.id === fId);
    if (fileIdx === -1) return;

    if (this.imagesEditList[fileIdx].src) {
      this.imagesEditList[fileIdx].loading = true;
      this.fileService
        .deleteFile(this.imagesEditList[fileIdx].src)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.imagesEditList.splice(fileIdx, 1);
          this.cdRef.markForCheck();
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
      this.fileService
        .deleteFile(this.filesEditList[fileIdx].src)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.filesEditList.splice(fileIdx, 1);
          this.cdRef.markForCheck();
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

    this.fileService
      .uploadFile(fileObj.tempFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: file => {
          fileObj.src = file.url;
          fileObj.loading = false;
          fileObj.tempFile = null;
          this.cdRef.markForCheck();
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
      this.like.emit(this.feedItem().id);
      this.showLikes[imgIdx] = true;

      setTimeout(() => {
        this.showLikes[imgIdx] = false;
        this.cdRef.markForCheck();
      }, 1000);
    }

    this.lastTouch = Date.now();
  }

  handleLike(index: number): void {
    this.loggerService.info("Лайк на изображении с индексом: ", index);
  }

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

  protected onExpandNewsText(elem: HTMLElement): void {
    this.expandService.onExpand(
      "description",
      elem,
      "expanded",
      this.expandService.readFullDescription()
    );
  }
}
