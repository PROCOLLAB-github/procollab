/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { BarComponent } from "@ui/components";
import { Trajectory } from "projects/skills/src/models/trajectory.model";
import { concatMap, map, Subscription } from "rxjs";

@Component({
  selector: "app-trajectory-detail",
  standalone: true,
  imports: [CommonModule, BarComponent, RouterOutlet],
  templateUrl: "./trajectory-detail.component.html",
  styleUrl: "./trajectory-detail.component.scss",
})
export class TrajectoryDetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);

  subscriptions$: Subscription[] = [];

  trajectory?: Trajectory;
  trackId?: string;

  ngOnInit(): void {
    const trackIdSub = this.route.params.subscribe(params => {
      this.trackId = params["trackId"];
    });

    const trajectorySub$ = this.route.data.pipe(map(r => r["data"])).subscribe(trajectory => {
      this.trajectory = trajectory;
    });

    trajectorySub$ && this.subscriptions$.push(trajectorySub$);
    trackIdSub && this.subscriptions$.push(trackIdSub);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
