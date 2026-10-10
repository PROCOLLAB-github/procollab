/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../ui/src/lib/services/desktop-layout.service";

import { ButtonDirective } from "@uilib";

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
@Component({
  selector: "app-vacancy-created-dialog",
  imports: [ButtonDirective, RouterLink, ButtonComponent, IconComponent, ModalComponent],
  templateUrl: "./vacancy-created-dialog.component.html",
  styleUrl: "./vacancy-created-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyCreatedDialogComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  readonly vacancyId = input.required<number>();
  readonly closed = output<void>();
  protected readonly AppRoutes = AppRoutes;
}
