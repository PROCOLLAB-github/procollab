/** @format */

import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ValidationService } from "@core/services";
import { ActivatedRoute } from "@angular/router";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";

@Component({
  selector: "app-news-form",
  templateUrl: "./news-form.component.html",
  styleUrls: ["./news-form.component.scss"],
})
export class NewsFormComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly projectNewsService: ProjectNewsService,
    private readonly validationService: ValidationService,
    private readonly route: ActivatedRoute,
    private readonly fileService: FileService
  ) {
    this.messageForm = fb.group({
      text: ["", [Validators.required]],
    });
  }

  @Output() addNews = new EventEmitter<ProjectNews>();

  ngOnInit(): void {}

  messageForm: FormGroup;

  onSubmit() {
    if (!this.validationService.getFormValidation(this.messageForm)) {
      return;
    }

    this.projectNewsService
      .addNews(this.route.snapshot.params["projectId"], {
        ...this.messageForm.value,
        files: this.imagesList.map(f => f.src),
      })
      .subscribe(news => {
        this.addNews.emit(news);

        this.imagesList = [];
        this.messageForm.reset();
      });
  }

  imagesList: {
    id: string;
    src: string;
    loading: boolean;
    error: boolean;
    tempFile: File | null;
  }[] = [];

  onUploadFile(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

    const fileObj: NewsFormComponent["imagesList"][0] = {
      id: nanoid(2),
      src: "",
      loading: true,
      error: false,
      tempFile: files[0],
    };
    this.imagesList.push(fileObj);
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
