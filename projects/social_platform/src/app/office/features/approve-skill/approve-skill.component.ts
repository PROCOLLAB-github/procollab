/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { PluralizePipe } from "@corelib";
import { Skill } from "@office/models/skill";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ButtonComponent } from "@ui/components";
import { map, of, Subscription, switchMap } from "rxjs";
import { AuthService } from "@auth/services";
import { ActivatedRoute } from "@angular/router";
import { ProfileService } from "projects/skills/src/app/profile/services/profile.service";
import { ProfileService as profileApproveSkillService } from "@auth/services/profile.service";
import { SnackbarService } from "@ui/services/snackbar.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ApproveSkillPeopleComponent } from "@office/shared/approve-skill-people/approve-skill-people.component";

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
  imports: [
    CommonModule,
    AvatarComponent,
    PluralizePipe,
    ButtonComponent,
    ModalComponent,
    ApproveSkillPeopleComponent,
  ],
})
export class ApproveSkillComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly profileApproveSkillService = inject(profileApproveSkillService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly cdRef = inject(ChangeDetectorRef);

  // Указатель на то что пользватель подтвердил навык
  isUserApproveSkill(skill: Skill, profileId: number): boolean {
    return skill.approves.some(approve => approve.confirmedBy.id === profileId);
  }

  // id пользователя за которого мы зарегистрировались
  loggedUserId?: number;

  // переменные для работы с модальным окном для вывода ошибки с подтверждением своего навыка
  approveOwnSkillModal = false;

  subscriptions: Subscription[] = [];

  // Получение данных о конкретном навыке
  @Input({ required: true }) skill!: Skill;

  ngOnInit(): void {
    const profileIdDataSub$ = this.authService.profile.pipe().subscribe({
      next: profile => {
        this.loggedUserId = profile.id;
      },
    });

    this.subscriptions.push(profileIdDataSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  /**
   * Подтверждение или отмена подтверждения навыка пользователя
   * @param skillId - идентификатор навыка
   * @param event - событие клика для предотвращения всплытия
   * @param skill - объект навыка для обновления
   */
  onToggleApprove(skillId: number, event: Event, skill: Skill, profileId: number) {
    event.stopPropagation();
    const userId = this.route.snapshot.params["id"];

    const isApprovedByCurrentUser = skill.approves.some(approve => {
      return approve.confirmedBy.id === profileId;
    });

    if (isApprovedByCurrentUser) {
      this.profileApproveSkillService.unApproveSkill(userId, skillId).subscribe(() => {
        skill.approves = skill.approves.filter(approve => approve.confirmedBy.id !== profileId);
        this.cdRef.markForCheck();
      });
    } else {
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
          )
        )
        .subscribe({
          next: updatedApprove => {
            skill.approves = [...skill.approves, updatedApprove];
            this.snackbarService.success("вы подтвердили навык");
            this.cdRef.markForCheck();
          },
          error: err => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 400) {
                this.approveOwnSkillModal = true;
                this.cdRef.markForCheck();
              }
            }
          },
        });
    }
  }
}
