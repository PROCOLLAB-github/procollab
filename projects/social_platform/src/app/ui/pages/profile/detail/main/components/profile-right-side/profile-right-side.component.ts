/** @format */

import { CommonModule, NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input, WritableSignal } from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { UserLinksPipe, TruncatePipe } from "@corelib";
import { ExpandService } from "@api/expand/expand.service";
import { User } from "@domain/auth/user.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { RouterModule } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";

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
  protected readonly expandService = inject(ExpandService);

  protected readonly readAll = this.expandService.readAll;

  protected readonly AppRoutes = AppRoutes;

  protected readonly isShowModal = this.profileDetailUIInfoService.isShowModal;

  openWorkInfoModal(): void {
    this.profileDetailUIInfoService.applyOpenWorkInfoModal();
  }
}
