/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Approve, Skill } from "@domain/skills/skill.model";
import { map, of, Subject, switchMap, takeUntil } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ApproveSkillUIInfoService } from "./approve-skill-ui-info.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { UnapproveSkillUseCase } from "@api/skills/use-cases/unapprove-skill.use-case";
import { ApproveSkillUseCase } from "@api/skills/use-cases/approve-skill.use-case";
import { ok } from "@domain/shared/result.type";

@Injectable()
export class ApproveskillInfoService {
  private readonly authRepository = inject(AuthInfoService);
  private readonly route = inject(ActivatedRoute);
  private readonly approveSkillUIInfoService = inject(ApproveSkillUIInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly unapproveSkillUseCase = inject(UnapproveSkillUseCase);
  private readonly approveSkillUseCase = inject(ApproveSkillUseCase);

  private readonly destroy$ = new Subject<void>();

  private readonly loggedUserId = this.profileDetailUIInfoService.loggedUserId;

  init(): void {
    this.authRepository.profile.pipe(takeUntil(this.destroy$)).subscribe({
      next: profile => {
        this.profileDetailUIInfoService.applySetLoggedUserId("logged", profile.id);
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

  unapproveSkill(userId: number, skillId: number, skill: Skill): void {
    this.unapproveSkillUseCase.execute(userId, skillId).subscribe({
      next: result => {
        if (result.ok) {
          skill.approves = skill.approves.filter(
            approve => approve.confirmedBy.id !== this.loggedUserId()
          );
        }
      },
    });
  }

  approveSkill(userId: number, skillId: number, skill: Skill): void {
    this.approveSkillUseCase
      .execute(userId, skillId)
      .pipe(
        switchMap(result => {
          if (!result.ok) return of(result);
          if (result.value.confirmedBy) return of(result);

          return this.authRepository.profile.pipe(
            map(profile => ok({ ...result.value, confirmedBy: profile } as Approve))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: result => {
          if (result.ok) {
            this.approveSkillUIInfoService.applyApprovedSkills(skill, result.value);
          }
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
      this.unapproveSkill(userId, skillId, skill);
    } else {
      this.approveSkill(userId, skillId, skill);
    }
  }
}
