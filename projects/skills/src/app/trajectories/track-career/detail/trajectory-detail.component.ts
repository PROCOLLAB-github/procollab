/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { BarComponent } from "@ui/components";
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

  trajectory?: any;
  trackId?: string;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.trackId = params["trackId"];
    });

    // const trajectorySub$ = this.route.data.pipe(map(r => r["data"])).subscribe(trajectory => {
    //   this.trajectory = trajectory;
    // });
    // trajectorySub$ && this.subscriptions$.push(trajectorySub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
