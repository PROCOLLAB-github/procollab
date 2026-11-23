/** @format */

import { CommonModule, Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  viewChild,
} from "@angular/core";
import { take } from "rxjs";
import { ButtonComponent } from "@ui/primitives";
import {
  ButtonDirective,
  DialogHeaderComponent,
  IconComponent,
  PageHeaderComponent,
  ImageFramingDirective,
} from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { Router, RouterModule } from "@angular/router";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ApproveSkillComponent } from "./approve-skill/approve-skill.component";
import { ProjectFormService } from "@api/project/project-form.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { DetailInfoService } from "./services/detail-info.service";
import { DetailProfileInfoService } from "./services/profile/detail-profile-info.service";
import { DetailProgramInfoService } from "./services/program/detail-program-info.service";
import { DetailProjectInfoService } from "./services/project/detail-project-info.service";
import { Program } from "@domain/program/program.model";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { ProgramLinksComponent } from "@ui/widgets/program-links/program-links.component";
import { ProjectEntryComponent } from "@ui/widgets/project-entry/project-entry.component";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileProjectInviteModalComponent } from "@ui/widgets/project-invite/profile-project-invite-modal.component";
import { PROGRAM_DEFAULT_COVER, PROGRAM_LOGO_SIZES } from "@utils/program-branding";
import { ProgramPreviewToolbarComponent } from "@ui/pages/program/launch/preview-toolbar.component";

/** Виджет детального просмотра сущности. */
@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  imports: [
    ProjectEntryComponent,
    PageHeaderComponent,
    ImageFramingDirective,
    CommonModule,
    RouterModule,
    IconComponent,
    ButtonDirective,
    ButtonComponent,
    ModalComponent,
    DialogHeaderComponent,
    AvatarComponent,
    ApproveSkillComponent,
    ProgramLinksComponent,
    ProfileProjectInviteModalComponent,
    ProgramPreviewToolbarComponent,
  ],
  providers: [
    ProfileDetailUIInfoService,
    DetailInfoService,
    DetailProfileInfoService,
    DetailProjectInfoService,
    DetailProgramInfoService,
    ProjectAdditionalService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeatilComponent implements OnInit, OnDestroy {
  private readonly programApplicationAction = viewChild<unknown, ElementRef<HTMLElement>>(
    "programApplicationAction",
    { read: ElementRef },
  );
  private readonly downloadCvAction = viewChild<unknown, ElementRef<HTMLElement>>(
    "downloadCvAction",
    { read: ElementRef },
  );
  readonly publicationsOnly = input(false);
  protected readonly defaultCover = PROGRAM_DEFAULT_COVER;
  protected get programCover(): string {
    const program = this.info();
    return (
      (this.appWidth < 1000 && program?.mobileCoverImageAddress) ||
      program?.coverImageAddress ||
      this.defaultCover
    );
  }
  protected get programCoverFraming() {
    return this.info()?.imageFraming?.[this.appWidth < 1000 ? "mobileCover" : "cover"] ?? null;
  }
  protected get avatarSize(): number {
    if (this.listType() === "program") {
      return this.appWidth < 1000 ? PROGRAM_LOGO_SIZES.mobile : PROGRAM_LOGO_SIZES.desktop;
    }
    return this.appWidth < 1000 ? 105 : 110;
  }
  protected readonly AppRoutes = AppRoutes;
  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  protected readonly location = inject(Location);
  protected readonly router = inject(Router);
  public readonly chatStateService = inject(ChatStateService);
  private readonly projectFormService = inject(ProjectFormService);

  private readonly detailInfoService = inject(DetailInfoService);
  protected readonly detailProfileInfoService = inject(DetailProfileInfoService);
  private readonly detailProgramInfoService = inject(DetailProgramInfoService);
  private readonly detailProjectInfoService = inject(DetailProjectInfoService);

  protected readonly info = this.detailInfoService.info;
  protected readonly profile = this.detailProfileInfoService.profile;
  protected readonly profileProjects = this.detailProfileInfoService.profileProjects;
  protected readonly listType = this.detailInfoService.listType;

  // Переменные для отображения данных в зависимости от url
  protected readonly isProjectsPage = this.detailProgramInfoService.isProjectsPage;
  protected readonly isMembersPage = this.detailProgramInfoService.isMembersPage;
  protected readonly isProjectsRatingPage = this.detailProgramInfoService.isProjectsRatingPage;
  protected readonly isAnalyticsPage = this.detailProgramInfoService.isAnalyticsPage;
  protected readonly isPublishedSolutionsPage =
    this.detailProgramInfoService.isPublishedSolutionsPage;

  protected readonly isTeamPage = this.detailProjectInfoService.isTeamPage;
  protected readonly isVacanciesPage = this.detailProjectInfoService.isVacanciesPage;
  protected readonly isProjectChatPage = this.detailProjectInfoService.isProjectChatPage;
  protected readonly isProjectWorkSectionPage =
    this.detailProjectInfoService.isProjectWorkSectionPage;

  protected readonly isKanbanBoardPage = this.detailProjectInfoService.isKanbanBoardPage;
  protected readonly isGantDiagramPage = this.detailProjectInfoService.isGantDiagramPage;

  // Сторонние переменные для работы с роутингом или доп проверок
  protected readonly backPath = this.detailInfoService.backPath;
  protected readonly isInProject = this.detailInfoService.isInProject;
  protected readonly queryCourseId = this.detailInfoService.queryCourseId;

  protected readonly isSended = this.detailProfileInfoService.isSended;
  protected readonly isProfileFill = this.detailProfileInfoService.isProfileFill;
  protected readonly profileFillAcknowledgementPending =
    this.detailProfileInfoService.profileFillAcknowledgementPending;

  // Переменные для работы с модалкой подачи проекта
  protected readonly selectedProjectId = this.detailProfileInfoService.selectedProjectId;

  protected readonly userType = this.detailInfoService.userType;

  // Сигналы для работы с модальными окнами с текстом
  protected readonly errorMessageModal = this.detailInfoService.errorMessageModal;

  protected readonly additionalFields = this.detailProgramInfoService.additionalFields;

  // Переменные для работы с модалками
  protected readonly isAssignProjectToProgramModalOpen =
    this.detailProgramInfoService.isAssignProjectToProgramModalOpen;

  protected readonly isProgramEndedModalOpen =
    this.detailProgramInfoService.isProgramEndedModalOpen;

  protected readonly isProgramSubmissionProjectsEndedModalOpen =
    this.detailProgramInfoService.isProgramSubmissionProjectsEndedModalOpen;

  protected readonly isLeaveProjectModalOpen =
    this.detailProjectInfoService.isLeaveProjectModalOpen; // Флаг модального окна выхода

  protected readonly isEditDisable = this.detailProjectInfoService.isEditDisable; // Флаг недоступности редактирования
  protected readonly isEditDisableModal = this.detailProjectInfoService.isEditDisableModal; // Флаг недоступности редактирования для модалки
  protected readonly openSupport = this.detailProjectInfoService.openSupport; // Флаг модального окна поддержки
  protected readonly leaderLeaveModal = this.detailProjectInfoService.leaderLeaveModal; // Флаг модального окна предупреждения лидера
  protected readonly isDelayModalOpen = this.detailProfileInfoService.isDelayModalOpen;

  // Переменные для работы с подтверждением навыков
  protected readonly showApproveSkillModal = this.detailProfileInfoService.showApproveSkillModal;
  protected readonly showSendInviteModal = this.detailProfileInfoService.showSendInviteModal;

  protected readonly openSkills = this.detailProfileInfoService.openSkills;

  // Геттеры для работы с отображением данных разного типа доступа
  protected readonly isUserManager = this.detailInfoService.isUserManager;
  protected readonly isUserMember = this.detailInfoService.isUserMember;
  protected readonly isUserExpert = this.detailInfoService.isUserExpert;
  protected readonly applicationActionDisabled =
    this.detailProgramInfoService.applicationActionDisabled;
  protected readonly applicationLabel = this.detailProgramInfoService.applicationLabel;

  // Сигналы для работы с модальными окнами с текстом
  protected readonly assignProjectToProgramModalMessage =
    this.detailProgramInfoService.assignProjectToProgramModalMessage;

  protected readonly projectForm = this.projectFormService.getForm();

  protected inviteTrigger: HTMLElement | null = null;
  protected readonly inviteForm = this.detailProfileInfoService.inviteForm;

  protected readonly isContactsModalOpen = this.detailInfoService.isContactsModalOpen;
  protected readonly contactLinks = this.detailInfoService.contactLinks;

  protected appWidth = window.innerWidth;

  @HostListener("window:resize")
  onResize() {
    this.appWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.detailInfoService.initializationDetail();
  }

  ngOnDestroy(): void {
    this.detailInfoService.destroy();
  }

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  acknowledgeProfileFillPrompt(continueFilling = false): void {
    this.detailProfileInfoService.acknowledgeProfileFillPrompt(continueFilling);
  }

  protected readonly legacyEntryProgramId = this.detailProgramInfoService.legacyEntryProgramId;
  addNewProject(programId: number): void {
    this.detailProgramInfoService.addNewProject(programId);
  }

  closeProgramApplicationError(modal: ModalComponent): void {
    if (!this.isAssignProjectToProgramModalOpen()) return;

    this.restoreDialogTriggerFocus(modal, this.programApplicationAction()?.nativeElement);
    this.isAssignProjectToProgramModalOpen.set(false);
  }

  onCloseLeaveProjectModal(): void {
    this.detailProjectInfoService.onCloseLeaveProjectModal();
  }

  onUnableEditingProject(): void {
    this.detailProjectInfoService.onUnableEditingProject();
  }

  onLeave() {
    this.detailProjectInfoService.onLeave();
  }

  onCopyLink(profileId: number): void {
    this.detailProfileInfoService.onCopyLink(profileId);
  }

  onOpenSkill(skillId: number) {
    this.openSkills[skillId] = !this.openSkills[skillId];
  }

  onCloseModal(skillId: number) {
    this.openSkills[skillId] = false;
  }

  downloadCV() {
    this.detailProfileInfoService.downloadCV();
  }

  closeDownloadCvDelay(modal: ModalComponent): void {
    if (!this.isDelayModalOpen()) return;

    this.restoreDialogTriggerFocus(modal, this.downloadCvAction()?.nativeElement);
    this.isDelayModalOpen.set(false);
  }

  private restoreDialogTriggerFocus(modal: ModalComponent, trigger?: HTMLElement): void {
    // Асинхронная загрузка может снять фокус с кнопки до открытия окна.
    modal.overlayRef
      ?.detachments()
      .pipe(take(1))
      .subscribe(() => {
        const button = trigger?.querySelector("button");
        if (
          button?.isConnected &&
          button.ownerDocument.activeElement === button.ownerDocument.body
        ) {
          button.focus();
        }
      });
  }

  inviteUser(event: Event): void {
    this.inviteTrigger =
      (event.currentTarget as HTMLElement).querySelector("button") ??
      (event.currentTarget as HTMLElement);
    this.detailProfileInfoService.inviteUser();
  }

  sendInvite(): void {
    this.detailProfileInfoService.sendInvite();
  }

  redirectDetailInfo(): void {
    this.detailInfoService.redirectDetailInfo();
  }

  routingToMyProjects(): void {
    this.detailProjectInfoService.routingToMyProjects();
  }

  checkPrograRegistrationEnded(event: Event, program: Program): void {
    this.detailProgramInfoService.checkPrograRegistrationEnded(event, program);
  }

  getOpenProgramRegistrationLink(program: Program): string | null {
    return this.detailProgramInfoService.getOpenRegistrationLink(program);
  }
}
