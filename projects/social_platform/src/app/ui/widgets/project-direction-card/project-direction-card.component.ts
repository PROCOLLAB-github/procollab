/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { IconComponent } from "@uilib";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Subscription } from "rxjs";
import { Achievement } from "@domain/auth/user.model";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { FileModel } from "@domain/file/file.model";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ButtonComponent } from "@ui/primitives";
import { TruncatePipe, DayjsPipe } from "@corelib";
import { Goal } from "@domain/project/goals.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { UpdateGoalUseCase } from "@api/project/use-cases/update-goal.use-case";

/** Универсальная карточка направлений профиля/проекта: навыки, достижения, цели и партнёры. */
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
    TruncatePipe,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDirectionCard implements OnInit, OnDestroy {
  readonly direction = input.required<string>();
  readonly icon = input.required<string>();
  readonly about = input.required<string | any[]>();
  readonly type = input.required<string>();
  readonly isOwner = input<boolean>();

  readonly profileInfoType = input<"skills" | "achievements" | undefined>();
  readonly projectInfoType = input<"goals" | "partners" | undefined>();

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly updateGoalUseCase = inject(UpdateGoalUseCase);
  private readonly logger = inject(LoggerService);

  private subscriptions: Subscription[] = [];

  isShowModal = false;
  isShowsConfirmGoal = false;

  isOpenInfo = false;

  goalCompleteHoverId: null | number = null;
  selectedGoal: Goal | null = null;

  listType?: "profile" | "project";

  // Поля для работы с достижениями
  private allAchievements: Achievement[] = [];
  years: { id: number; year: number }[] = [];
  files: FileModel[] = [];
  achievementsInfo = signal<Achievement[]>([]);
  currentYear = 0;

  mouseHover(goalId: number): void {
    if (this.isOwner()) {
      if (goalId) {
        this.goalCompleteHoverId = goalId;
      }
    }
  }

  mouseLeave(): void {
    if (this.isOwner()) {
      this.goalCompleteHoverId = null;
    }
  }

  ngOnInit(): void {
    const listTypeSub$ = this.route.data.subscribe(data => {
      this.listType = data["listType"];
    });

    if (this.profileInfoType() === "achievements" && Array.isArray(this.about)) {
      this.allAchievements = this.about as Achievement[];
      this.years = Array.from(
        new Map(this.allAchievements.map(a => [a.year, { id: a.id, year: a.year }])).values(),
      );
      this.subscribeYearQueryParam();
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
      id: goal.id,
      title: goal.title,
      completionDate: goal.completionDate,
      responsible: goal.responsible,
      isDone: true,
    };

    this.updateGoalUseCase.execute(Number(projectId), goal.id, completedGoal).subscribe({
      next: result => {
        if (!result.ok) {
          this.logger.error("Ошибка при обновлении цели:", result.error.cause);
          return;
        }

        const response = result.value;
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

  private subscribeYearQueryParam(): void {
    const infoParamSub$ = this.route.queryParams.pipe(map(p => p["year"])).subscribe(year => {
      if (!year) {
        this.isOpenInfo = false;
        this.achievementsInfo.set([]);
        this.files = [];
        return;
      }

      this.isOpenInfo = true;
      this.currentYear = +year;

      const filtered = this.allAchievements.filter(a => +a.year === +year);
      this.achievementsInfo.set(filtered);
      this.files = filtered.flatMap(a => (a.files ?? []) as FileModel[]);
    });

    this.subscriptions.push(infoParamSub$);
  }
}
