/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-project-news-card",
  templateUrl: "./news-card.component.html",
  styleUrls: ["./news-card.component.scss"],
})
export class NewsCardComponent implements OnInit {
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute
  ) {}

  @Input() newsItem!: ProjectNews;
  @Output() delete = new EventEmitter<number>();

  readMore = false;

  ngOnInit(): void {}

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
}
