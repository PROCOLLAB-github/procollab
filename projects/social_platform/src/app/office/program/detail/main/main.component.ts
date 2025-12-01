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
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  concatMap,
  fromEvent,
  map,
  noop,
  Observable,
  of,
  Subscription,
  tap,
  throttleTime,
} from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramNewsService } from "@office/program/services/program-news.service";
import { FeedNews } from "@office/projects/models/project-news.model";
import { expandElement } from "@utils/expand-element";
import { ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { ProgramNewsCardComponent } from "../shared/news-card/news-card.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { ApiPagination } from "@models/api-pagination.model";
import { TagComponent } from "@ui/components/tag/tag.component";
import { ProjectService } from "@office/services/project.service";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { LoadingService } from "@office/services/loading.service";
import { ProjectAdditionalService } from "@office/projects/edit/services/project-additional.service";
import { SoonCardComponent } from "@office/shared/soon-card/soon-card.component";
import { NewsFormComponent } from "@office/features/news-form/news-form.component";
import { AsyncPipe } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { NewsCardComponent } from "@office/features/news-card/news-card.component";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  imports: [
    IconComponent,
    ButtonComponent,
    ProgramNewsCardComponent,
    UserLinksPipe,
    AsyncPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    ModalComponent,
    MatProgressBarModule,
    SoonCardComponent,
    NewsFormComponent,
    ModalComponent,
    MatProgressBarModule,
    AvatarComponent,
    TagComponent,
    TruncatePipe,
    RouterModule,
    NewsCardComponent,
  ],
})
export class ProgramDetailMainComponent implements OnInit, OnDestroy {
  constructor(
    private readonly programService: ProgramService,
    private readonly programNewsService: ProgramNewsService,
    private readonly projectService: ProjectService,
    private readonly projectAdditionalService: ProjectAdditionalService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdRef: ChangeDetectorRef,
    private readonly loadingService: LoadingService
  ) {}

  get isAssignProjectToProgramError() {
    return this.projectAdditionalService.getIsAssignProjectToProgramError()();
  }

  get errorAssignProjectToProgramModalMessage() {
    return this.projectAdditionalService.getErrorAssignProjectToProgramModalMessage();
  }

  news = signal<FeedNews[]>([]);
  totalNewsCount = signal(0);
  fetchLimit = signal(10);
  fetchPage = signal(0);

  // Сигналы для работы с модальными окнами с текстом
  showProgramModal = signal(false);
  showProgramModalErrorMessage = signal<string | null>(null);

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

    const routeModalSub$ = this.route.queryParams.subscribe(param => {
      if (param["access"] === "accessDenied") {
        this.loadingService.hide();

        this.showProgramModal.set(true);
        this.showProgramModalErrorMessage.set("У вас не доступа к этой вкладке!");

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { access: null },
          queryParamsHandling: "merge",
          replaceUrl: true,
        });
      }
    });

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
      .subscribe({
        next: news => {
          if (news.results?.length) {
            this.news.set(news.results);
            this.totalNewsCount.set(news.count);

            setTimeout(() => {
              this.setupNewsObserver();
            }, 100);
          }

          this.loadingService.hide();
        },
        error: () => {
          this.loadingService.hide();

          this.showProgramModal.set(true);
          this.showProgramModalErrorMessage.set("Произошла ошибка при загрузке программы");
        },
      });

    setTimeout(() => {
      this.checkDescriptionExpandable();
      this.cdRef.detectChanges();
    }, 100);

    this.loadEvent = fromEvent(window, "load");

    this.subscriptions$().push(program$);
    this.subscriptions$().push(programIdSubscription$);
    this.subscriptions$().push(routeModalSub$);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkDescriptionExpandable();
      this.cdRef.detectChanges();
    }, 150);

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

          setTimeout(() => {
            this.setupNewsObserver();
          }, 100);
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

  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(ProgramNewsCardComponent) ProgramNewsCardComponent?: ProgramNewsCardComponent;
  @ViewChild("descEl") descEl?: ElementRef;

  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });
    this.programNewsService.readNews(this.route.snapshot.params["programId"], ids).subscribe(noop);
  }

  onAddNews(news: { text: string; files: string[] }): void {
    this.programNewsService
      .addNews(this.route.snapshot.params["programId"], news)
      .subscribe(newsRes => {
        this.newsFormComponent?.onResetForm();
        this.news.update(news => [newsRes, ...news]);
      });
  }

  onDelete(newsId: number) {
    const item = this.news().find((n: any) => n.id === newsId);
    if (!item) return;
    this.programNewsService.deleteNews(this.route.snapshot.params["programId"], newsId).subscribe({
      next: () => {
        const index = this.news().findIndex(news => news.id === newsId);
        this.news().splice(index, 1);
      },
    });
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

  onEdit(news: FeedNews, newsId: number) {
    this.programNewsService
      .editNews(this.route.snapshot.params["programId"], newsId, news)
      .subscribe({
        next: (resNews: any) => {
          const newsIdx = this.news().findIndex(n => n.id === resNews.id);
          this.news()[newsIdx] = resNews;
          this.ProgramNewsCardComponent?.onCloseEditMode();
        },
      });
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  closeModal(): void {
    this.showProgramModal.set(false);
    this.loadingService.hide();
  }

  clearAssignProjectToProgramError(): void {
    this.projectAdditionalService.clearAssignProjectToProgramError();
  }

  private loadEvent?: Observable<Event>;

  private checkDescriptionExpandable(): void {
    const descElement = this.descEl?.nativeElement;

    if (!descElement || !this.program?.description) {
      this.descriptionExpandable = false;
      return;
    }

    this.descriptionExpandable = descElement.scrollHeight > descElement.clientHeight;
  }

  private setupNewsObserver(): void {
    const observer = new IntersectionObserver(this.onNewsInVew.bind(this), {
      root: document.querySelector(".office__body"),
      rootMargin: "0px 0px 0px 0px",
      threshold: 0,
    });

    document.querySelectorAll(".news__item").forEach(element => {
      observer.observe(element);
    });
  }

  program?: Program;
  registerDateExpired!: boolean;
  descriptionExpandable!: boolean;
  readFullDescription = false;
}
