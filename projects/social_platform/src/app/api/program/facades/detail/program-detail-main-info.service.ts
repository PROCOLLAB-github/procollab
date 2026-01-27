/** @format */

import { ElementRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { concatMap, fromEvent, map, of, Subject, takeUntil, tap, throttleTime } from "rxjs";
import { ProgramNewsService } from "../../program-news.service";
import { FeedNews } from "projects/social_platform/src/app/domain/project/project-news.model";
import { LoadingService } from "@ui/services/loading/loading.service";
import { ExpandService } from "../../../expand/expand.service";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";
import { NewsInfoService } from "../../../news/news-info.service";

@Injectable()
export class ProgramDetailMainService {
  private readonly programNewsService = inject(ProgramNewsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loadingService = inject(LoadingService);
  private readonly expandService = inject(ExpandService);
  private readonly newsInfoService = inject(NewsInfoService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  private observer?: IntersectionObserver;
  private readonly destroy$ = new Subject<void>();

  private readonly totalNewsCount = this.programDetailMainUIInfoService.totalNewsCount;
  readonly fetchLimit = signal(10);
  readonly fetchPage = signal(0);

  readonly news = this.newsInfoService.news;
  readonly program = this.programDetailMainUIInfoService.program;
  readonly programId = this.programDetailMainUIInfoService.programId;

  initializationProgramDetailMain(descEl: ElementRef | undefined): void {
    this.initializationProgramId();
    this.initializationProgramQueryParams();
    this.initializationProgram(descEl);
  }

  private initializationProgramId(): void {
    this.route.params
      .pipe(
        map(params => params["programId"]),
        tap(programId => {
          this.programId.set(programId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private initializationProgramQueryParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(param => {
      if (param["access"] === "accessDenied") {
        this.loadingService.hide();
        this.programDetailMainUIInfoService.applyInitProgramQueryParams();

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { access: null },
          queryParamsHandling: "merge",
          replaceUrl: true,
        });
      }
    });
  }

  private initializationProgram(descEl: ElementRef | undefined): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        tap(program => {
          this.programDetailMainUIInfoService.applyFormatingProgramData(program);
        }),
        concatMap(program => {
          if (program.isUserMember) {
            return this.fetchNews(0, this.fetchLimit());
          } else {
            return of({ results: [], count: 0 });
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: news => {
          if (news.results?.length) {
            this.newsInfoService.applySetNews(news);
            this.programDetailMainUIInfoService.applyInitProgram(news);

            setTimeout(() => {
              this.setupNewsObserver();
            }, 100);

            this.loadingService.hide();
          }
        },
        error: () => {
          this.loadingService.hide();

          this.programDetailMainUIInfoService.applyProgramOpenModal("error");
        },
      });

    this.checkDescriptionTimeout(descEl);
  }

  initScroll(target: HTMLElement, descEl: ElementRef | undefined): void {
    this.checkDescriptionTimeout(descEl);

    fromEvent(target, "scroll")
      .pipe(
        throttleTime(2000),
        concatMap(() => this.onScroll()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  destroy(): void {
    this.observer?.disconnect();

    this.destroy$.next();
    this.destroy$.complete();
  }

  private onScroll() {
    if (this.news().length >= this.totalNewsCount()) {
      return of(null);
    }

    const nextPage = this.fetchPage() + 1;
    const offset = nextPage * this.fetchLimit();

    this.fetchPage.set(nextPage);

    return this.fetchNews(offset, this.fetchLimit()).pipe(
      tap(({ count, results }) => {
        this.totalNewsCount.set(count);
        this.newsInfoService.applyUpdateNews(results);

        setTimeout(() => {
          this.setupNewsObserver();
        }, 100);
      })
    );
  }

  private fetchNews(offset: number, limit: number) {
    const programId = this.route.snapshot.params["programId"];
    return this.programNewsService.fetchNews(limit, offset, programId);
  }

  private onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });
    this.programNewsService
      .readNews(this.route.snapshot.params["programId"], ids)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onAddNews(news: { text: string; files: string[] }) {
    return this.programNewsService.addNews(this.route.snapshot.params["programId"], news).pipe(
      tap(newsRes => {
        this.newsInfoService.applyAddNews(newsRes);
      })
    );
  }

  onDelete(newsId: number) {
    const item = this.news().find((n: any) => n.id === newsId);
    if (!item) return;
    this.programNewsService
      .deleteNews(this.route.snapshot.params["programId"], newsId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newsInfoService.applyDeleteNews(newsId);
        },
      });
  }

  onLike(newsId: number) {
    const item = this.news().find((n: any) => n.id === newsId);
    if (!item) return;

    this.programNewsService
      .toggleLike(this.route.snapshot.params["programId"], newsId, !item.isUserLiked)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.newsInfoService.applyLikeNews(newsId);
      });
  }

  onEdit(news: FeedNews, newsId: number) {
    return this.programNewsService
      .editNews(this.route.snapshot.params["programId"], newsId, news)
      .pipe(
        tap((newsRes: any) => {
          this.newsInfoService.applyEditNews(newsRes);
        })
      );
  }

  closeModal(): void {
    this.programDetailMainUIInfoService.applyProgramCloseModal();
    this.loadingService.hide();
  }

  private setupNewsObserver(): void {
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(this.onNewsInVew.bind(this), {
      root: document.querySelector(".office__body"),
      threshold: 0,
    });

    document.querySelectorAll(".news__item").forEach(el => {
      this.observer!.observe(el);
    });
  }

  checkDescriptionTimeout(descEl: ElementRef | undefined): void {
    setTimeout(() => {
      this.expandService.checkExpandable("description", !!this.program()?.description, descEl);
    }, 100);
  }
}
