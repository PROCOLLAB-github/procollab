/** @format */

import { ButtonDirective, CardDirective, DesktopLayoutService } from "@uilib";
import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { DatePipe, NgClass, NgTemplateOutlet } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ProgramImageFraming } from "@domain/program/program-image-framing.model";
import { AppRoutes } from "@api/paths/app-routes";

/** Shared saved identity for the public catalog and organizer cards. */
export interface ProgramCardData {
  id: number;
  name: string;
  imageAddress?: string | null;
  imageFraming?: ProgramImageFraming | null;
  datetimeRegistrationEnds: string | null;
  datetimeStarted: string | null;
  datetimeFinished: string | null;
  isUserMember?: boolean;
  draft?: boolean;
}

/** Карточка программы с краткой информацией для списков. */
@Component({
  selector: "app-program-card",
  templateUrl: "./program-card.component.html",
  styleUrl: "./program-card.component.scss",
  imports: [
    CardDirective,
    AvatarComponent,
    DatePipe,
    NgClass,
    NgTemplateOutlet,
    ButtonDirective,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCardComponent {
  protected readonly desktopLayout = inject(DesktopLayoutService).desktop;
  protected readonly paths = AppRoutes;
  readonly program = input.required<ProgramCardData>();
  readonly management = input(false);
  readonly registerDateExpired = computed(() => {
    const deadline = this.program().datetimeRegistrationEnds;
    return Boolean(deadline && Date.now() > Date.parse(deadline));
  });
  readonly registrationState = computed(() => {
    if (this.management() && this.program().draft) return "draft";
    if (this.registerDateExpired()) return "ended";
    if (!this.management() && this.program().isUserMember) return "participating";
    return this.program().datetimeRegistrationEnds ? "actual" : "not-set";
  });
}
