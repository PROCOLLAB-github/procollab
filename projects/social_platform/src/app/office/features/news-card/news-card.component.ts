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
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly fileService: FileService,
    private readonly cdRef: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      text: ["", [Validators.required]],
    });
  }

  @Input({ required: true }) feedItem!: FeedNews;
  @Input({ required: true }) resourceLink!: (string | number)[];
  @Input({ required: false }) contentId?: number;
  @Input() isOwner?: boolean;

  @Output() delete = new EventEmitter<number>();
  @Output() like = new EventEmitter<number>();
  @Output() edited = new EventEmitter<FeedNews>();

  placeholderUrl = "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif";

  newsTextExpandable!: boolean;
  readMore = false;
  editMode = false;
  editForm: FormGroup;

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
      text: this.feedItem.text,
    });

    const processedFiles = this.feedItem.files.map(file => {
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

    this.showLikes = this.feedItem.files.map(() => false);

    this.imagesViewList = processedFiles.filter(f => {
      const [type] = (f.mimeType || "").split("/");
      return type === "image" || f.mimeType === "x-empty";
    });

    this.filesViewList = processedFiles.filter(f => {
      const [type] = (f.mimeType || "").split("/");
      return type !== "image" && f.mimeType !== "x-empty";
    });

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
    const isProject = this.resourceLink[0].toString().includes("projects");
    let fullUrl = "";

    if (isProject) {
      fullUrl = `${location.origin}/office/projects/${this.contentId}/news/${this.feedItem.id}`;
    } else {
      fullUrl = `${location.origin}/office/profile/${this.contentId}/news/${this.feedItem.id}`;
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

    this.feedItem.text = this.editForm.value.text;

    this.feedItem.files = [...this.imagesViewList, ...this.filesViewList];

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
      text: this.feedItem.text,
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
      this.like.emit(this.feedItem.id);
      this.showLikes[imgIdx] = true;

      setTimeout(() => {
        this.showLikes[imgIdx] = false;
      }, 1000);
    }

    this.lastTouch = Date.now();
  }

  handleLike(index: number): void {
    console.log("Лайк на изображении с индексом: ", index);
  }

  onExpandNewsText(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readMore = !isExpanded;
  }
}
