/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  BehaviorSubject,
  concatMap,
  fromEvent,
  map,
  of,
  Subscription,
  tap,
  throttleTime,
} from "rxjs";
import { AsyncPipe } from "@angular/common";
import { RatingCardComponent } from "@office/program/shared/rating-card/rating-card.component";
import { ProjectRate } from "@office/program/models/project-rate";
import { ProjectRatingService } from "@office/shared/project-rating/services/project-rating.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  standalone: true,
  imports: [RouterLink, RatingCardComponent, AsyncPipe],
})
export class ListComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectRatingService: ProjectRatingService
  ) {}

  isListOfAll = this.router.url.includes("/all");

  projects$ = new BehaviorSubject<ProjectRate[]>([]);

  totalProjCount!: number;
  loadedProjCount!: number;
  fetchLimit = 4;
  fetchPage = 1;

  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    const initProjects$ = this.route.data
      .pipe(
        map(r => r["data"]),
        map(r => r["results"])
      )
      .subscribe(projects => {
        this.projects$.next(projects);
        this.loadedProjCount = projects.length;
      });

    this.subscriptions$.push(initProjects$);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe();

      this.subscriptions$.push(scrollEvents$);
    }
  }

  onScroll() {
    if (this.totalProjCount && this.loadedProjCount >= this.totalProjCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom > 0) return of({});

    return this.onFetch(this.fetchPage++ * this.fetchLimit, this.fetchLimit);
  }

  onFetch(offset: number, limit: number) {
    const programId = this.route.parent?.snapshot.params["programId"];

    const observable = this.isListOfAll
      ? this.projectRatingService.getAll(programId, offset, limit)
      : this.projectRatingService.getRated(programId, offset, limit);

    return observable.pipe(
      tap(({ count, results }) => {
        this.totalProjCount = count;
        this.projects$.next([...this.projects$.value, ...results]);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach(s => s.unsubscribe());
  }
}
