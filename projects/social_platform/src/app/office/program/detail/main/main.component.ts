/** @format */

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramNewsService } from "@office/program/services/program-news.service";
import { FeedNews } from "@office/projects/models/project-news.model";
import { expandElement } from "@utils/expand-element";
import { ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { ProgramNewsCardComponent } from "../shared/news-card/news-card.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ApiPagination } from "@models/api-pagination.model";
import { TagComponent } from "@ui/components/tag/tag.component";

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
    TagComponent,
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

  news = signal<FeedNews[]>([]);
  totalNewsCount = signal(0);
  fetchLimit = signal(10);
  fetchPage = signal(0);

  programId?: number;

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const programIdSubscription$ = this.route.params
      .pipe(
        map(params => params["programId"]),
        tap(programId => {
          this.programId = programId;
          this.fetchNews(0, this.fetchLimit());
        })
      )
      .subscribe();

    const program$ = this.route.data
      .pipe(
        map(r => r["data"]),
        tap(program => {
          this.program = program;
          this.registerDateExpired = Date.now() > Date.parse(program.datetimeRegistrationEnds);
        }),
        concatMap(program => {
          if (program.isUserMember) {
            return this.fetchNews(0, this.fetchLimit());
          } else {
            return of({} as ApiPagination<FeedNews>);
          }
        })
      )
      .subscribe(news => {
        if (news.results?.length) {
          this.news.set(news.results);
          this.totalNewsCount.set(news.count);
        }
      });

    this.subscriptions$().push(program$);
    this.subscriptions$().push(programIdSubscription$);
  }

  ngAfterViewInit() {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();

    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(2000)
        )
        .subscribe();

      this.subscriptions$().push(scrollEvents$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  onScroll() {
    if (this.news().length < this.totalNewsCount()) {
      return this.fetchNews(this.fetchPage() * this.fetchLimit(), this.fetchLimit()).pipe(
        tap(({ results }) => {
          this.news.update(news => [...news, ...results]);
          if (results.length < this.fetchLimit()) {
            // console.log('No more to fetch')
          } else {
            this.fetchPage.update(p => p + 1);
          }
        })
      );
    }

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom > 0) return of({});

    this.fetchPage.update(p => p + 1);

    return this.fetchNews(this.fetchPage() * this.fetchLimit(), this.fetchLimit());
  }

  fetchNews(offset: number, limit: number) {
    const programId = this.route.snapshot.params["programId"];

    return this.programNewsService.fetchNews(limit, offset, programId).pipe(
      tap(({ count, results }) => {
        this.totalNewsCount.set(count);
        this.news.update(news => [...news, ...results]);
      })
    );
  }

  @ViewChild("descEl") descEl?: ElementRef;

  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });

    this.programNewsService.readNews(this.route.snapshot.params["programId"], ids).subscribe(noop);
  }

  onLike(newsId: number) {
    const item = this.news().find((n: any) => n.id === newsId);
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

  program?: Program;
  registerDateExpired!: boolean;
  descriptionExpandable!: boolean;
  readFullDescription = false;
}
