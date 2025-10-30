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
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { DayjsPipe } from "@corelib";
import { ButtonComponent } from "@ui/components";
import { ProjectService } from "@office/services/project.service";
import { Goal } from "@office/models/goals.model";
import { EditorSubmitButtonDirective } from "@ui/directives/editor-submit-button.directive";
@Component({
  selector: "app-project-direction-card",
  templateUrl: "./project-direction-card.component.html",
  styleUrl: "./project-direction-card.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    ModalComponent,
    TagComponent,
    FileItemComponent,
    AvatarComponent,
    DayjsPipe,
    ButtonComponent,
    EditorSubmitButtonDirective,
  ],
  standalone: true,
})
export class ProjectDirectionCard implements OnInit, OnDestroy {
  @Input() direction!: string;
  @Input() icon!: string;
  @Input() about!: string | any[];
  @Input() type!: string;
  @Input() isOwner!: boolean;

  @Input() profileInfoType?: "skills" | "achievements";
  @Input() projectInfoType?: "goals" | "partners";

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly achievementsService = inject(ProfileService);
  private readonly projectService = inject(ProjectService);

  private subscriptions: Subscription[] = [];

  isShowModal = false;
  isShowsConfirmGoal = false;

  isOpenInfo = false;

  goalCompleteHoverId: null | number = null;
  selectedGoal: Goal | null = null;

  listType?: "profile" | "project";

  // Поля для работы с достижениями
  achievements: Pick<Achievement, "id" | "year">[] = [];
  files: FileModel[] = [];
  achievementsInfo = signal<Achievement[]>([]);
  currentYear = 0;

  mouseHover(goalId: number): void {
    if (this.isOwner) {
      if (goalId) {
        this.goalCompleteHoverId = goalId;
      }
    }
  }

  mouseLeave(): void {
    if (this.isOwner) {
      this.goalCompleteHoverId = null;
    }
  }

  ngOnInit(): void {
    const listTypeSub$ = this.route.data.subscribe(data => {
      this.listType = data["listType"];
    });

    if (this.profileInfoType === "achievements") {
      if (Array.isArray(this.about)) {
        this.about = Array.from(
          new Map(this.about.map(a => [a.year, { id: a.id, year: a.year }])).values()
        );
      }
      this.getAchievementsByYear();
    }

    this.subscriptions.push(listTypeSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  openConfirmModal(goal: Goal): void {
    this.selectedGoal = goal;
    this.isShowsConfirmGoal = true;
    this.router.navigate([], {
      queryParams: { goalId: goal.id },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  confirmCompleteGoal(): void {
    const projectId = this.route.snapshot.params["projectId"];
    const goalId = +this.route.snapshot.queryParams["goalId"];

    if (!goalId || !Array.isArray(this.about)) return;

    const goal = this.about.find((g: Goal) => g.id === goalId);

    if (!goal) return;

    const completedGoal = {
      ...goal,
      isDone: true,
    };

    this.projectService.editGoal(projectId, goal.id, completedGoal).subscribe({
      next: response => {
        if (Array.isArray(this.about)) {
          const index = this.about.findIndex((g: Goal) => g.id === goalId);
          if (index !== -1) {
            this.about[index] = response;
          }
        }

        this.isShowsConfirmGoal = false;
        this.goalCompleteHoverId = null;
        this.selectedGoal = null;

        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true,
        });
      },
      error: error => {
        console.error("Ошибка при обновлении цели:", error);
      },
    });
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
