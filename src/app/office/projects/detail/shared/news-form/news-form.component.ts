/** @format */

import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ValidationService } from "@core/services";
import { ActivatedRoute } from "@angular/router";
import { ProjectNews } from "@office/projects/models/project-news.model";

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
    private readonly route: ActivatedRoute
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
      .addNews(this.route.snapshot.params.projectId, this.messageForm.value)
      .subscribe(news => {
        this.addNews.emit(news);
      });
  }
}
