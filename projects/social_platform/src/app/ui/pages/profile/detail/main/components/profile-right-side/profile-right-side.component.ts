/** @format */

import { CommonModule, NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input, WritableSignal } from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "@core/lib/pipes/user/user-links.pipe";
import { ExpandService } from "@api/expand/expand.service";
import { User } from "@domain/auth/user.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
