/** @format */

import { CommonModule, NgTemplateOutlet } from "@angular/common";
import { Component, inject, Input, WritableSignal } from "@angular/core";
import { IconComponent } from "@ui/components";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "projects/core/src/lib/pipes/user/user-links.pipe";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProfileDetailUIInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-profile-right-side",
  templateUrl: "./profile-right-side.component.html",
  styleUrl: "./profile-right-side.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    RouterModule,
    NgTemplateOutlet,
    UserLinksPipe,
    TruncatePipe,
    ModalComponent,
  ],
  standalone: true,
})
export class ProfileRightSideComponent {
  @Input() user!: WritableSignal<User | undefined>;

  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly expandService = inject(ExpandService);

  protected readonly readAllLinks = this.expandService.readAllLinks;
  protected readonly readAllEducation = this.expandService.readAllEducation;
  protected readonly readAllWorkExperience = this.expandService.readAllWorkExperience;
  protected readonly readAllProjects = this.expandService.readAllProjects;

  protected readonly isShowModal = this.profileDetailUIInfoService.isShowModal;

  openWorkInfoModal(): void {
    this.profileDetailUIInfoService.applyOpenWorkInfoModal();
  }
}
