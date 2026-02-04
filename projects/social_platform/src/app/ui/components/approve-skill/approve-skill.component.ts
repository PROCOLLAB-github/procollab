/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { PluralizePipe } from "@corelib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ButtonComponent } from "@ui/components";
import { map, of, Subscription, switchMap } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ApproveSkillPeopleComponent } from "@ui/shared/approve-skill-people/approve-skill-people.component";
import { AuthService } from "../../../api/auth";
import { ProfileService as ProfileApproveSkillService } from "../../../api/auth/profile.service";
import { Skill } from "../../../domain/skills/skill";
import { ApproveskillInfoService } from "./services/approve-skill-info.service";
import { ApproveSkillUIInfoService } from "./services/approve-skill-ui-info.service";

/**
 * @params skill - информация о навыке (обязательно)
 *
 * Компонент на основе полученных данных о навыке
 * выполняет логику подтверждения навыка
 * с помощью сервисов связанных с навыками пользователя
 */
@Component({
  selector: "app-approve-skill",
  styleUrl: "./approve-skill.component.scss",
  templateUrl: "./approve-skill.component.html",
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, ApproveSkillPeopleComponent],
  providers: [ApproveskillInfoService, ApproveSkillUIInfoService],
})
export class ApproveSkillComponent implements OnInit, OnDestroy {
  private readonly approveskillInfoService = inject(ApproveskillInfoService);
  private readonly approveSkillUIInfoService = inject(ApproveSkillUIInfoService);

  // Указатель на то что пользватель подтвердил навык
  isUserApproveSkill(skill: Skill): boolean {
    return this.approveskillInfoService.isUserApproveSkill(skill);
  }

  // переменные для работы с модальным окном для вывода ошибки с подтверждением своего навыка
  protected readonly approveOwnSkillModal = this.approveSkillUIInfoService.approveOwnSkillModal;

  // Получение данных о конкретном навыке
  @Input({ required: true }) skill!: Skill;

  ngOnInit(): void {
    this.approveskillInfoService.init();
  }

  ngOnDestroy(): void {
    this.approveskillInfoService.destroy();
  }

  /**
   * Подтверждение или отмена подтверждения навыка пользователя
   * @param skillId - идентификатор навыка
   * @param event - событие клика для предотвращения всплытия
   * @param skill - объект навыка для обновления
   */
  onToggleApprove(skillId: number, event: Event, skill: Skill) {
    this.approveskillInfoService.onToggleApprove(skillId, event, skill);
  }
}
