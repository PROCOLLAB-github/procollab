/** @format */

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AvatarComponent as CanonicalAvatar, DesktopLayoutService } from "@uilib";

/** Legacy desktop presentation with the canonical avatar inputs and mobile view. */
@Component({
  selector: "app-avatar",
  templateUrl: "./avatar.component.html",
  styleUrl: "./avatar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent extends CanonicalAvatar {
  protected readonly desktopLayout = inject(DesktopLayoutService).desktop;
}
