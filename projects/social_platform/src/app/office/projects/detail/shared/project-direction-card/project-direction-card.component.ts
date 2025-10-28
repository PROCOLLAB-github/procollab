/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnDestroy, OnInit, signal } from "@angular/core";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { TagComponent } from "@ui/components/tag/tag.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ProfileService } from "@auth/services/profile.service";
import { map, Subscription, switchMap } from "rxjs";
import { Achievement } from "@auth/models/user.model";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { FileModel } from "@office/models/file.model";
@Component({
  selector: "app-project-direction-card",
  templateUrl: "./project-direction-card.component.html",
  styleUrl: "./project-direction-card.component.scss",
  imports: [CommonModule, IconComponent, ModalComponent, TagComponent, FileItemComponent],
  standalone: true,
})
export class ProjectDirectionCard implements OnInit, OnDestroy {
  @Input() direction!: string;
  @Input() icon!: string;
  @Input() about!: string | any[];
  @Input() type!: string;

  @Input() profileInfoType?: "skills" | "achievements" = "skills";

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly achievementsService = inject(ProfileService);

  private subscriptions: Subscription[] = [];

  isShowModal = false;
  isOpenInfo = false;

  achievements: Pick<Achievement, "id" | "year">[] = [];
  files: FileModel[] = [];
  achievementsInfo = signal<Achievement[]>([]);
  currentYear = 0;

  ngOnInit(): void {
    if (this.profileInfoType === "achievements") {
      if (Array.isArray(this.about)) {
        this.about = Array.from(
          new Map(this.about.map(a => [a.year, { id: a.id, year: a.year }])).values()
        );
      }
      this.getAchievementsByYear();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  openInfo(achievementYear: string): void {
    this.router.navigate([], {
      queryParams: {
        year: achievementYear,
      },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  backToYears(): void {
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });

    this.isOpenInfo = false;
  }

  private getAchievementsByYear(): void {
    const infoParamSub$ = this.route.queryParams
      .pipe(
        map(p => p["year"]),
        switchMap(year => {
          if (year) {
            this.isOpenInfo = true;
            this.currentYear = year;
            return this.achievementsService
              .getAchievements()
              .pipe(
                map((achievements: Achievement[]) =>
                  achievements.filter((achievement: Achievement) => +achievement.year === +year)
                )
              );
          } else {
            this.isOpenInfo = false;
            this.achievementsInfo.set([]);
            return [];
          }
        })
      )
      .subscribe({
        next: achievements => {
          this.achievementsInfo.set(achievements);

          this.files = achievements.flatMap(a => (a.files ?? []) as FileModel[]);
        },
      });

    this.subscriptions.push(infoParamSub$);
  }
}
