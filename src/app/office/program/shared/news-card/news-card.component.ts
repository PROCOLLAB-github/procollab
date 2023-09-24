/** @format */

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ActivatedRoute } from "@angular/router";
import { expandElement } from "@utils/expand-element";

@Component({
  selector: "app-program-news-card",
  templateUrl: "./news-card.component.html",
  styleUrls: ["./news-card.component.scss"],
})
export class ProgramNewsCardComponent implements OnInit {
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  @Input() newsItem!: ProjectNews;
  @Input() isOwner!: boolean;
  @Output() delete = new EventEmitter<number>();
  @Output() like = new EventEmitter<number>();
  @Output() edited = new EventEmitter<ProjectNews>();

  newsTextExpandable!: boolean;
  readMore = false;
  editMode = false;

  ngOnInit(): void {
    this.showLikes = this.newsItem.files.map(() => false);
  }

  @ViewChild("newsTextEl") newsTextEl?: ElementRef;

  ngAfterViewInit(): void {
    const newsTextElem = this.newsTextEl?.nativeElement;
    this.newsTextExpandable = newsTextElem?.clientHeight < newsTextElem?.scrollHeight;

    this.cdRef.detectChanges();
  }

  onCopyLink(): void {
    const projectId = this.route.snapshot.params["projectId"];

    navigator.clipboard
      .writeText(`https://app.procollab.ru/office/program/${projectId}/news/${this.newsItem.id}`)
      .then(() => {
        this.snackbarService.success("Ссылка скопирована");
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
