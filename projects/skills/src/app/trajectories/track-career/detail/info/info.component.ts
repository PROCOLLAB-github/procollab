/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
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
import { map, Subscription } from "rxjs";
import { SkillCardComponent } from "../../../../skills/shared/skill-card/skill-card.component";
import { CommonModule } from "@angular/common";
import { MonthBlockComponent } from "projects/skills/src/app/profile/shared/month-block/month-block.component";
import { Trajectory, TrajectorySkills } from "projects/skills/src/models/trajectory.model";
import { TrajectoriesService } from "../../../trajectories.service";
import { UserData } from "projects/skills/src/models/profile.model";
import { ProfileService } from "projects/skills/src/app/profile/services/profile.service";

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

  subscriptions$: Subscription[] = [];

  trajectory!: Trajectory;
  trajectorySkills!: TrajectorySkills;
  mentor!: UserData;

  @ViewChild("descEl") descEl?: ElementRef;

  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe((r: Trajectory) => {
      this.trajectory = r;
    });

    this.trajectoryService.getTrajectorySkills(this.trajectory.id).subscribe(skills => {
      this.trajectorySkills = skills;
    });

    this.profileService.getUserData().subscribe((r: UserData) => {
      this.mentor = r;
    });
  }

  mockMonts = [
    {
      month: "1 месяц",
      successfullyDone: true,
      year: 2025,
    },
    {
      month: "2 месяц",
      successfullyDone: true,
      year: 2025,
    },
    {
      month: "3 месяц",
      successfullyDone: false,
      year: 2025,
    },
    {
      month: "4 месяц",
      successfullyDone: false,
      year: 2025,
    },
  ];

  readFullDescription = false;
  descriptionExpandable?: boolean;

  description =
    "Четырехмесячный интенсив, в котором ты поймешь азы карьерного планирования. С опытным наставником, ты разберешь свои сильные стороны, проработаешь барьеры на пути к успешной карьере. Четырехмесячный интенсив, в котором ты поймешь азы карьерного планирования. С опытным наставником, ты разберешь свои сильные стороны, проработаешь барьеры на пути к успешной карьере. ";

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

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";
}
