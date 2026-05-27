/** @format */

import { inject, Injectable, Injector } from "@angular/core";
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
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { toObservable } from "@angular/core/rxjs-interop";

@Injectable()
export class ApproveskillInfoService {
  private readonly authRepository = inject(AuthInfoService);
  private readonly route = inject(ActivatedRoute);
  private readonly approveSkillUIInfoService = inject(ApproveSkillUIInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly unapproveSkillUseCase = inject(UnapproveSkillUseCase);
  private readonly approveSkillUseCase = inject(ApproveSkillUseCase);
  private readonly injector = inject(Injector);

  private readonly destroy$ = new Subject<void>();

  private readonly loggedUserId = this.profileDetailUIInfoService.loggedUserId;
  private readonly profile = this.profileInfoService.profile;

  init(): void {
    this.profileDetailUIInfoService.applySetLoggedUserId("logged", this.profile()!.id);
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

          return toObservable(this.profile, { injector: this.injector }).pipe(
            map(profile =>
              ok({
                ...result.value,
                confirmedBy: {
                  id: profile!.id,
                  firstName: profile!.firstName,
                  lastName: profile!.lastName,
                  avatar: profile!.personal.avatar,
                  speciality: profile!.personal.speciality,
                  v2Speciality: profile!.personal.v2Speciality,
                },
              } as Approve)
            )
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
