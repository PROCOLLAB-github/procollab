/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { Webinar } from "projects/skills/src/models/webinars.model";
import { TrajectoriesService } from "../../trajectories.service";
import { TrajectoryComponent } from "../shared/trajectory/trajectory.component";
import { Trajectory } from "projects/skills/src/models/trajectory.model";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, RouterModule, TrajectoryComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class TrajectoriesListComponent implements OnInit, AfterViewInit, OnDestroy {
  router = inject(Router);
  route = inject(ActivatedRoute);
  trajectoriesService = inject(TrajectoriesService);
  cdRef = inject(ChangeDetectorRef);

  totalItemsCount = signal(0);
  trajectoriesList = signal<Trajectory[]>([]);
  trajectoriesPage = signal(1);
  perFetchTake = signal(20);

  type = signal<"all" | "my" | null>(null);

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "all" | "my");

    const routeData$ = this.route.data.pipe(map(r => r["data"]));

    const subscription = routeData$.subscribe((trajectories: Trajectory[]) => {
      if (this.type() === "all") {
        this.trajectoriesList.set(trajectories);
        this.totalItemsCount.set(trajectories.length);
      } else {
        this.trajectoriesList.set(trajectories);
      }
    });

    this.subscriptions$().push(subscription);
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);
      this.subscriptions$().push(scrollEvents$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach(s => s.unsubscribe());
  }

  onScroll() {
    if (this.totalItemsCount() && this.trajectoriesList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(this.trajectoriesPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((trajectoryChunk: Trajectory[]) => {
          this.trajectoriesPage.update(page => page + 1);
          this.trajectoriesList.update(items => [...items, ...trajectoryChunk]);
        })
      );
    }

    return of({});
  }

  onFetch(offset: number, limit: number) {
    return this.trajectoriesService.getTrajectories(limit, offset).pipe(
      tap((res: any) => {
        this.totalItemsCount.set(res.count);
        this.trajectoriesList.update(items => [...items, ...res.results]);
      }),
      map(res => res)
    );
  }
}
