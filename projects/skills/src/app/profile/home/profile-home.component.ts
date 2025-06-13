/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MonthBlockComponent } from "../shared/month-block/month-block.component";
import { SkillsBlockComponent } from "../shared/skills-block/skills-block.component";
import { ProgressBlockComponent } from "../shared/progress-block/progress-block.component";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map, Subscription } from "rxjs";
import { mockMonthsList } from "projects/core/src/consts/list-mock-months";
import { ProfileService } from "../services/profile.service";
import { TrajectoryBlockComponent } from "../shared/trajectory-block/trajectory-block.component";

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [
    CommonModule,
    MonthBlockComponent,
    SkillsBlockComponent,
    ProgressBlockComponent,
    TrajectoryBlockComponent,
  ],
  templateUrl: "./profile-home.component.html",
  styleUrl: "./profile-home.component.scss",
})
export class ProfileHomeComponent implements OnInit, OnDestroy {
  readonly mockMonts = mockMonthsList;

  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);

  profileData = toSignal(this.route.data.pipe(map(r => r["data"])));

  type: "months" | "trajectory" = "months";

  subscription$: Subscription[] = [];

  ngOnInit(): void {
    const isSubscribedSub$ = this.profileService.getSubscriptionData().subscribe(r => {
      this.type = r.isSubscribed ? "trajectory" : "months";
    });

    isSubscribedSub$ && this.subscription$.push(isSubscribedSub$);
  }

  ngOnDestroy(): void {
    this.subscription$.forEach($ => $.unsubscribe());
  }
}
