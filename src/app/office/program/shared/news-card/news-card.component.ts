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
  selector: "app-program-news-card",
  templateUrl: "./news-card.component.html",
  styleUrls: ["./news-card.component.scss"],
})
export class ProgramNewsCardComponent implements OnInit {
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute
  ) {}

  @Input() newsItem!: ProjectNews;
  @Input() isOwner!: boolean;
  @Output() delete = new EventEmitter<number>();
  @Output() like = new EventEmitter<number>();
  @Output() edited = new EventEmitter<ProjectNews>();

  readMore = false;
  editMode = false;

  ngOnInit(): void {
    this.showLikes = this.newsItem.files.map(() => false);
  }

  onCopyLink(): void {
    const projectId = this.route.snapshot.params["projectId"];

    navigator.clipboard
      .writeText(`https://app.procollab.ru/office/program/${projectId}/news/${this.newsItem.id}`)
      .then(() => {
        this.snackbarService.success("Ссылка скопирована");
      });
  }

  menuOpen = false;

  onCloseMenu() {
    this.menuOpen = false;
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
