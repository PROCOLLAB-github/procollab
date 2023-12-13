/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ValidationService } from "@core/services";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { FileService } from "@core/services/file.service";
import { nanoid } from "nanoid";
import { expandElement } from "@utils/expand-element";
import { FileModel } from "@models/file.model";
import { forkJoin, noop, Observable, tap } from "rxjs";
import { FormControlPipe } from "@core/pipes/form-control.pipe";
import { DayjsPipe } from "@core/pipes/dayjs.pipe";
import { ButtonComponent, IconComponent } from "@ui/components";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { FileUploadItemComponent } from "@ui/components/file-upload-item/file-upload-item.component";
import { ImgCardComponent } from "../img-card/img-card.component";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { ClickOutsideModule } from "ng-click-outside";
import { NgIf, NgFor } from "@angular/common";

@Component({
  selector: "app-news-card",
  templateUrl: "./news-card.component.html",
  styleUrl: "./news-card.component.scss",
  standalone: true,
  imports: [
    NgIf,
    ClickOutsideModule,
    IconComponent,
    TextareaComponent,
    ReactiveFormsModule,
    NgFor,
    ImgCardComponent,
    FileUploadItemComponent,
    FileItemComponent,
    ButtonComponent,
    DayjsPipe,
    FormControlPipe,
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

  @Input({ required: true }) newsItem!: ProjectNews;
  @Input() isOwner?: boolean;
  @Output() delete = new EventEmitter<number>();
  @Output() like = new EventEmitter<number>();
  @Output() edited = new EventEmitter<ProjectNews>();

  newsTextExpandable!: boolean;
  readMore = false;
  editMode = false;

  editForm: FormGroup;

  ngOnInit(): void {
    this.editForm.setValue({
      text: this.newsItem.text,
    });

    this.showLikes = this.newsItem.files.map(() => false);

    this.imagesViewList = this.newsItem.files.filter(
      f => f.mimeType.split("/")[0] === "image" || f.mimeType.split("/")[1] === "x-empty"
    );
    this.filesViewList = this.newsItem.files.filter(
      f => f.mimeType.split("/")[0] !== "image" && f.mimeType.split("/")[1] !== "x-empty"
    );

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

  imagesViewList: FileModel[] = [];
  filesViewList: FileModel[] = [];

  @ViewChild("newsTextEl") newsTextEl?: ElementRef;

  ngAfterViewInit(): void {
    const newsTextElem = this.newsTextEl?.nativeElement;
    this.newsTextExpandable = newsTextElem?.clientHeight < newsTextElem?.scrollHeight;

    this.cdRef.detectChanges();
  }

  onCopyLink(): void {
    const projectId = this.route.snapshot.params["projectId"];

    navigator.clipboard
      .writeText(`${location.origin}/office/projects/${projectId}/news/${this.newsItem.id}`)
      .then(() => {
        this.snackbarService.success("Ссылка скопирована");
      });
  }

  menuOpen = false;

  onCloseMenu() {
    this.menuOpen = false;
  }

  onEditSubmit(): void {
    if (!this.validationService.getFormValidation(this.editForm)) return;
    this.edited.emit({
      ...this.editForm.value,
      files: this.imagesEditList.filter(f => f.src).map(f => f.src),
    });
  }

  onCloseEditMode() {
    this.editMode = false;
  }

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
          tempFile: files[0],
        };
        this.imagesEditList.push(fileObj);

        observableArray.push(
          this.fileService.uploadFile(files[i]).pipe(
            tap(file => {
              fileObj.src = file.url;
              fileObj.loading = false;

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

    forkJoin(observableArray).subscribe(noop);
    // const fileObj: NewsCardComponent["imagesEditList"][0] = {
    //   id: nanoid(2),
    //   src: "",
    //   loading: true,
    //   error: false,
    //   tempFile: files[0],
    // };
    // this.imagesEditList.push(fileObj);
    // this.fileService.uploadFile(files[0]).subscribe({
    //   next: file => {
    //     fileObj.src = file.url;
    //     fileObj.loading = false;
    //
    //     fileObj.tempFile = null;
    //   },
    //   error: () => {
    //     fileObj.error = true;
    //     fileObj.loading = false;
    //   },
    // });
  }

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
