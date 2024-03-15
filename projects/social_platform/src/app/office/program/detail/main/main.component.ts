/** @format */

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { concatMap, map, noop, of, Subscription, tap } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramNewsService } from "@office/program/services/program-news.service";
import { FeedNews } from "@office/projects/models/project-news.model";
import { expandElement } from "@utils/expand-element";
import { ParseLinksPipe, ParseBreaksPipe } from "projects/core";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { ProgramNewsCardComponent } from "../shared/news-card/news-card.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ApiPagination } from "@models/api-pagination.model";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  imports: [
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    RouterLink,
    ProgramNewsCardComponent,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
  ],
})
export class ProgramDetailMainComponent implements OnInit, OnDestroy {
  constructor(
    private readonly programService: ProgramService,
    private readonly programNewsService: ProgramNewsService,
    private readonly route: ActivatedRoute,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const program$ = this.route.data
      .pipe(
        map(r => r["data"]),
        tap(program => {
          this.program = program;
          this.registerDateExpired = Date.now() > Date.parse(program.datetimeRegistrationEnds);
        }),
        concatMap(program => {
          if (program.isUserMember) {
            return this.programNewsService.fetchNews(program.id);
          } else {
            return of({} as ApiPagination<FeedNews>);
          }
        })
      )
      .subscribe(news => {
        if (news.results?.length) {
          this.news = news.results;

          setTimeout(() => {
            const observer = new IntersectionObserver(this.onNewsInVew.bind(this), {
              root: document.querySelector(".office__body"),
              rootMargin: "0px 0px 0px 0px",
              threshold: 0,
            });
            document.querySelectorAll(".news__item").forEach(e => {
              observer.observe(e);
            });
          });
        }
      });

    this.subscriptions$.push(program$);
  }

  @ViewChild("descEl") descEl?: ElementRef;

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];
  news: FeedNews[] = [];
  program?: Program;
  // program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

  registerDateExpired!: boolean;

  descriptionExpandable!: boolean;
  readFullDescription = false;

  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });

    this.programNewsService.readNews(this.route.snapshot.params["programId"], ids).subscribe(noop);
  }

  onLike(newsId: number) {
    const item = this.news.find(n => n.id === newsId);
    if (!item) return;

    this.programNewsService
      .toggleLike(this.route.snapshot.params["programId"], newsId, !item.isUserLiked)
      .subscribe(() => {
        item.likesCount = item.isUserLiked ? item.likesCount - 1 : item.likesCount + 1;
        item.isUserLiked = !item.isUserLiked;
      });
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
