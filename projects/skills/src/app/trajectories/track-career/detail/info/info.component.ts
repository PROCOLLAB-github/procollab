/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { ButtonComponent } from "@ui/components";
import { AvatarComponent, IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { map, Observable, Subscription } from "rxjs";
import { SkillCardComponent } from "../../../../skills/shared/skill-card/skill-card.component";
import { CommonModule } from "@angular/common";
import { MonthBlockComponent } from "projects/skills/src/app/profile/shared/month-block/month-block.component";
import {
  Trajectory,
  TrajectorySkills,
  UserTrajectory,
} from "projects/skills/src/models/trajectory.model";
import { TrajectoriesService } from "../../../trajectories.service";
import { Month, UserData } from "projects/skills/src/models/profile.model";
import { ProfileService } from "projects/skills/src/app/profile/services/profile.service";
import { SkillService } from "projects/skills/src/app/skills/services/skill.service";
import { BreakpointObserver } from "@angular/cdk/layout";

@Component({
  selector: "app-detail",
  standalone: true,
  imports: [
    IconComponent,
    ButtonComponent,
    RouterModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    SkillCardComponent,
    AvatarComponent,
    CommonModule,
    MonthBlockComponent,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class TrajectoryInfoComponent implements OnInit, AfterViewInit {
  route = inject(ActivatedRoute);
  router = inject(Router);

  cdRef = inject(ChangeDetectorRef);

  trajectoryService = inject(TrajectoriesService);
  profileService = inject(ProfileService);
  skillService = inject(SkillService);
  breakpointObserver = inject(BreakpointObserver);

  subscriptions$: Subscription[] = [];

  trajectory!: Trajectory;
  userTrajectory = signal<UserTrajectory | null>(null);
  profileId!: number;

  completeAllMainSkills = computed(
    () => this.userTrajectory()?.availableSkills.every(skill => skill.isDone) ?? false
  );

  availableSkills = computed(
    () => this.userTrajectory()?.availableSkills.filter(s => !s.isDone) ?? []
  );

  completedSkills = computed(() => [
    ...(this.userTrajectory()?.completedSkills ?? []),
    ...(this.userTrajectory()?.availableSkills.filter(s => s.isDone) ?? []),
  ]);

  @ViewChild("descEl") descEl?: ElementRef;

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  ngOnInit(): void {
    this.desktopMode$.subscribe(r => console.log(r));

    this.route.data.pipe(map(r => r["data"])).subscribe(r => {
      this.trajectory = r[0];
      this.userTrajectory.set({ ...r[1], individualSkills: r[2] });

      if (!this.trajectory.isActiveForUser) {
        this.router.navigate(["/trackCar/all"]);
      }

      this.userTrajectory()?.availableSkills.forEach(i => (i.freeAccess = true));
      this.userTrajectory()?.completedSkills.forEach(i => {
        i.freeAccess = true;
        i.isDone = true;
      });
      this.userTrajectory()?.unavailableSkills.forEach(i => (i.freeAccess = true));
      this.userTrajectory()?.individualSkills.forEach(i => (i.freeAccess = true));
    });

    this.profileService.getUserData().subscribe((r: UserData) => {
      this.profileId = r.id;
    });

    this.mockMonts = Array.from({ length: this.userTrajectory()!.durationMonths }, (_, index) => {
      const monthNumber = index + 1;

      return {
        month: `${monthNumber} месяц`,
        successfullyDone: monthNumber <= this.userTrajectory()!.activeMonth,
      };
    });
  }

  mockMonts: Month[] = [];

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  readFullDescription = false;
  descriptionExpandable?: boolean;

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onSkillClick(skillId: number) {
    this.skillService.setSkillId(skillId);
    this.router.navigate(["skills", skillId]);
  }
}
