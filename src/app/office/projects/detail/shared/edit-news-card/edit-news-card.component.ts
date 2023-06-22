/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@core/services";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-edit-news-card",
  templateUrl: "./edit-news-card.component.html",
  styleUrls: ["./edit-news-card.component.scss"],
})
export class EditNewsCardComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly projectNewsService: ProjectNewsService,
    private readonly route: ActivatedRoute
  ) {
    this.newsForm = this.fb.group({
      text: ["", [Validators.required]],
    });
  }

  @Input() newsItem!: ProjectNews;
  @Output() edited = new EventEmitter<void>();

  ngOnInit(): void {
    this.newsForm.setValue({
      text: this.newsItem.text,
    });
  }

  newsForm: FormGroup;

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.newsForm)) return;

    this.projectNewsService
      .editNews(this.route.snapshot.params.projectId, this.newsItem.id, this.newsForm.value)
      .subscribe(() => {
        this.edited.emit();
      });
  }
}
