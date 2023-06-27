/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@core/services";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { FileService } from "@core/services/file.service";
import { nanoid } from "nanoid";

@Component({
  selector: "app-project-news-card",
  templateUrl: "./news-card.component.html",
  styleUrls: ["./news-card.component.scss"],
})
export class NewsCardComponent implements OnInit {
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly projectNewsService: ProjectNewsService,
    private readonly fileService: FileService
  ) {
    this.editForm = this.fb.group({
      text: ["", [Validators.required]],
    });
  }

  @Input() newsItem!: ProjectNews;
  @Input() isOwner!: boolean;
  @Output() delete = new EventEmitter<number>();
  @Output() like = new EventEmitter<number>();
  @Output() edited = new EventEmitter<ProjectNews>();

  readMore = false;
  editMode = false;

  editForm: FormGroup;

  ngOnInit(): void {
    this.editForm.setValue({
      text: this.newsItem.text,
    });

    this.showLikes = this.newsItem.files.map(() => false);

    this.filesList = this.newsItem.files.map(src => ({
      src,
      id: nanoid(),
      error: false,
      loading: false,
      tempFile: null,
    }));
  }

  onCopyLink(): void {
    const projectId = this.route.snapshot.params.projectId;

    navigator.clipboard
      .writeText(`https://app.procollab.ru/office/projects/${projectId}/news/${this.newsItem.id}`)
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

    this.projectNewsService
      .editNews(this.route.snapshot.params.projectId, this.newsItem.id, {
        ...this.editForm.value,
        files: this.filesList.filter(f => f.src).map(f => f.src),
      })
      .subscribe(resNews => {
        this.editMode = false;

        this.edited.emit(resNews);
      });
  }

  filesList: {
    id: string;
    src: string;
    loading: boolean;
    error: boolean;
    tempFile: File | null;
  }[] = [];

  onUploadFile(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

    const fileObj: NewsCardComponent["filesList"][0] = {
      id: nanoid(2),
      src: "",
      loading: true,
      error: false,
      tempFile: files[0],
    };
    this.filesList.push(fileObj);
    this.fileService.uploadFile(files[0]).subscribe({
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

  onDeletePhoto(fId: string) {
    const fileIdx = this.filesList.findIndex(f => f.id === fId);

    if (this.filesList[fileIdx].src) {
      this.filesList[fileIdx].loading = true;
      this.fileService.deleteFile(this.filesList[fileIdx].src).subscribe(() => {
        this.filesList.splice(fileIdx, 1);
      });
    } else {
      this.filesList.splice(fileIdx, 1);
    }
  }

  onRetryUpload(id: string) {
    const fileObj = this.filesList.find(f => f.id === id);
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
}
