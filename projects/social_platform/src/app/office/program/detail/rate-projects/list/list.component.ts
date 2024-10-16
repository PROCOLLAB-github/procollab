/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { concatMap, debounceTime, fromEvent, map, of, Subject, Subscription, switchMap, tap, throttleTime } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { RatingCardComponent } from "@office/program/shared/rating-card/rating-card.component";
import { ProjectRate } from "@office/program/models/project-rate";
import { ProjectRatingService } from "@office/program/services/project-rating.service";
import Fuse from "fuse.js";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  standalone: true,
  imports: [RouterLink, RatingCardComponent, AsyncPipe],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectRatingService: ProjectRatingService
  ) { }

  isListOfAll = this.router.url.includes("/all");
  isRatedByExpert = signal<boolean | undefined>(undefined);
  searchValue = signal<string>('')

  projects = signal<ProjectRate[]>([]);
  initialProjects: ProjectRate[] = [];

  totalProjCount = signal(0);
  fetchLimit = signal(8);
  fetchPage = signal(0);

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const initProjects$ = this.route.data
      .pipe(
        map(r => r["data"]),
        map(r => ({ projects: r["results"], count: r["count"] }))
      )
      .subscribe(({ projects, count }) => {
        this.initialProjects = projects;
        this.projects.set(projects);
        this.totalProjCount.set(count);
      });

    const queryParams$ = this.route.queryParams
      .pipe(
        debounceTime(200),
        tap(params => {
          const isRatedByExpert = params["is_rated_by_expert"] === "true" ? true :
            params["is_rated_by_expert"] === "false" ? false : undefined;
          const searchValue = params['name__contains'];

          this.isRatedByExpert.set(isRatedByExpert);
          this.searchValue.set(searchValue);
        }),
        switchMap(() =>
          this.onFetch(this.fetchPage() * this.fetchLimit(), this.fetchLimit())
        )
      )
      .subscribe(result => {
        this.projects.set(result.results);
      });

    this.subscriptions$().push(initProjects$, queryParams$);
  }


  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          debounceTime(200),
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
    if (this.projects().length >= this.totalProjCount()) {
      console.log("All projects loaded, no more fetching.");
      return of({});
    }

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom > 0) return of({});

    this.fetchPage.update(p => p + 1);

    return this.onFetch(this.fetchPage() * this.fetchLimit(), this.fetchLimit());
  }

  onFetch(offset: number, limit: number) {
    const programId = this.route.parent?.snapshot.params["programId"];
    const observable = this.projectRatingService.getAll(
      programId,
      offset,
      limit,
      this.isRatedByExpert(),
      this.searchValue(),
    );

    return observable.pipe(
      tap(({ count, results }) => {
        this.totalProjCount.set(count);
        this.projects.set(results);
      })
    );
  }
}
