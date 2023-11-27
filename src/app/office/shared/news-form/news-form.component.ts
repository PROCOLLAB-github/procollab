/** @format */

import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@core/services";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";
import { forkJoin, noop, Observable, tap } from "rxjs";

@Component({
  selector: "app-news-form",
  templateUrl: "./news-form.component.html",
  styleUrl: "./news-form.component.scss",
})
export class NewsFormComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly fileService: FileService
  ) {
    this.messageForm = fb.group({
      text: ["", [Validators.required]],
    });
  }

  @Output() addNews = new EventEmitter<{ text: string; files: string[] }>();

  ngOnInit(): void {}

  messageForm: FormGroup;

  onSubmit() {
    if (!this.validationService.getFormValidation(this.messageForm)) {
      return;
    }

    this.addNews.emit({
      ...this.messageForm.value,
      files: [...this.imagesList.map(f => f.src), ...this.filesList.map(f => f.src)],
    });
  }

  onResetForm() {
    this.imagesList = [];
    this.messageForm.reset();
  }

  imagesList: {
    id: string;
    src: string;
    loading: boolean;
    error: boolean;
    tempFile: File | null;
  }[] = [];

  filesList: {
    id: string;
    loading: boolean;
    error: string;
    src: string;
    tempFile: File;
  }[] = [];

  onUploadFile(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

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
