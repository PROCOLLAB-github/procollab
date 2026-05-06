/** @format */

import { inject, Injectable } from "@angular/core";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { Router } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";

@Injectable({ providedIn: "root" })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  profileRedirect(profileId?: number): void {
    if (!profileId) return;

    this.router
      .navigateByUrl(AppRoutes.profile.detail(profileId))
      .then(() => this.logger.debug("Router Changed form ProfileEditComponent"));
  }
}
