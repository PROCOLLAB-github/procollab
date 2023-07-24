/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ActivatedRoute } from "@angular/router";
import { concatMap, noop, of, Subscription, tap } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramNewsService } from "@office/program/services/program-news.service";
import { ProjectNews, ProjectNewsRes } from "@office/projects/models/project-news.model";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class ProgramDetailMainComponent implements OnInit, OnDestroy {
  constructor(
    private readonly programService: ProgramService,
    private readonly programNewsService: ProgramNewsService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const program$ = this.programService
      .getOne(this.route.parent?.snapshot.params["programId"])
      .pipe(
        tap(program => {
          this.program = program;
        }),
        concatMap(program => {
          if (program.isUserMember) {
            return this.programNewsService.fetchNews(program.id);
          } else {
            return of({} as ProjectNewsRes);
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

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];
  news: ProjectNews[] = [];
  program?: Program;
  // program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

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
}
