/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@core/services";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";

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
    private readonly projectNewsService: ProjectNewsService
  ) {
    this.editForm = this.fb.group({
      text: ["", [Validators.required]],
    });
  }

  @Input() newsItem!: ProjectNews;
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
      .editNews(this.route.snapshot.params.projectId, this.newsItem.id, this.editForm.value)
      .subscribe(resNews => {
        this.editMode = false;

        this.edited.emit(resNews);
      });
  }
}
