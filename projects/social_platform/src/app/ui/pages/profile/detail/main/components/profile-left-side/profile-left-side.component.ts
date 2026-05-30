/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input, WritableSignal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { YearsFromBirthdayPipe, TruncatePipe } from "@corelib";
import { IconComponent } from "@ui/primitives";
import { ExpandService } from "@api/expand/expand.service";
import { User } from "@domain/auth/user.model";
import { AppRoutes } from "@api/paths/app-routes";

/** Левая колонка профиля: аватар и основные данные. */
@Component({
    selector: "app-profile-left-side",
    templateUrl: "./profile-left-side.component.html",
    styleUrl: "./profile-left-side.component.scss",
    imports: [CommonModule, RouterModule, IconComponent, YearsFromBirthdayPipe, TruncatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileLeftSideComponent {
  @Input() user!: WritableSignal<User | undefined>;

  protected readonly expandService = inject(ExpandService);

  protected readonly readAllPrograms = this.expandService.readAll()["programs"];

  protected readonly AppRoutes = AppRoutes;
}
