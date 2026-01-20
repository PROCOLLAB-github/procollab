/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { Approve, Skill } from "projects/social_platform/src/app/domain/skills/skill";

@Injectable()
export class ApproveSkillUIInfoService {
  private readonly snackbarService = inject(SnackbarService);

  // переменные для работы с модальным окном для вывода ошибки с подтверждением своего навыка
  approveOwnSkillModal = signal<boolean>(false);

  applyApprovedSkills(skill: Skill, updatedApprove: Approve): void {
    skill.approves = [...skill.approves, updatedApprove];
    this.snackbarService.success("вы подтвердили навык");
  }

  applyOpenErrorModal(): void {
    this.approveOwnSkillModal.set(true);
  }
}
