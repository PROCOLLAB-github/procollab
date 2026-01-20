/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";
import { ProfileService as ProfileApproveSkillService } from "../../../../api/auth/profile.service";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { map, of, Subject, switchMap, takeUntil } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ApproveSkillUIInfoService } from "./approve-skill-ui-info.service";

@Injectable()
export class ApproveskillInfoService {
  private readonly authService = inject(AuthService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly route = inject(ActivatedRoute);
  private readonly profileApproveSkillService = inject(ProfileApproveSkillService);
  private readonly approveSkillUIInfoService = inject(ApproveSkillUIInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly loggedUserId = this.projectsDetailUIInfoService.loggedUserId;

  init(): void {
    this.authService.profile.pipe(takeUntil(this.destroy$)).subscribe({
      next: profile => {
        this.projectsDetailUIInfoService.applySetLoggedUserId("logged", profile.id);
      },
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Указатель на то что пользватель подтвердил навык
  isUserApproveSkill(skill: Skill): boolean {
    return skill.approves.some(approve => approve.confirmedBy.id === this.loggedUserId());
  }

  unApproveSkill(userId: number, skillId: number, skill: Skill): void {
    this.profileApproveSkillService.unApproveSkill(userId, skillId).subscribe(() => {
      skill.approves = skill.approves.filter(
        approve => approve.confirmedBy.id !== this.loggedUserId()
      );
    });
  }

  approveSkill(userId: number, skillId: number, skill: Skill): void {
    this.profileApproveSkillService
      .approveSkill(userId, skillId)
      .pipe(
        switchMap(newApprove =>
          newApprove.confirmedBy
            ? of(newApprove)
            : this.authService.profile.pipe(
                map(profile => ({
                  ...newApprove,
                  confirmedBy: profile,
                }))
              )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: updatedApprove => {
          this.approveSkillUIInfoService.applyApprovedSkills(skill, updatedApprove);
        },
        error: err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.approveSkillUIInfoService.applyOpenErrorModal();
            }
          }
        },
      });
  }

  /**
   * Подтверждение или отмена подтверждения навыка пользователя
   * @param skillId - идентификатор навыка
   * @param event - событие клика для предотвращения всплытия
   * @param skill - объект навыка для обновления
   */
  onToggleApprove(skillId: number, event: Event, skill: Skill) {
    event.stopPropagation();
    const userId = this.route.snapshot.params["id"];

    const isApprovedByCurrentUser = skill.approves.some(approve => {
      return approve.confirmedBy.id === this.loggedUserId();
    });

    if (isApprovedByCurrentUser) {
      this.unApproveSkill(userId, skillId, skill);
    } else {
      this.approveSkill(userId, skillId, skill);
    }
  }
}
