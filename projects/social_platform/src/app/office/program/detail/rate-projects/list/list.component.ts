/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { concatMap, fromEvent, map, of, Subscription, tap, throttleTime } from "rxjs";
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
  ) {}

  isListOfAll = this.router.url.includes("/all");

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

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      if (search) {
        const fuse = new Fuse(this.initialProjects, {
          keys: ["name"],
        });

        const filteredProjects = fuse.search(search).map(el => el.item);
        this.projects.set(filteredProjects);
      } else {
        this.projects.set(this.initialProjects);
      }
    });

    this.subscriptions$().push(initProjects$);
    this.subscriptions$().push(querySearch$);
  }

  ngAfterViewInit() {
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
    if (this.projects().length < this.totalProjCount()) {
      return this.onFetch(this.fetchPage() * this.fetchLimit(), this.fetchLimit()).pipe(
        tap(({ results }) => {
          this.projects.update(projects => [...projects, ...results]);
          if (this.projects().length >= this.totalProjCount()) {
            console.log("Projects count reached!");
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

    return this.onFetch(this.fetchPage() * this.fetchLimit(), this.fetchLimit());
  }

  onFetch(offset: number, limit: number) {
    const programId = this.route.parent?.snapshot.params["programId"];

    const observable = this.isListOfAll
      ? this.projectRatingService.getAll(programId, offset, limit)
      : this.projectRatingService.getRated(programId, offset, limit);

    return observable.pipe(
      tap(({ count, results }) => {
        this.totalProjCount.set(count);
        this.projects.update(projects => [...projects, ...results]);
      })
    );
  }
}
