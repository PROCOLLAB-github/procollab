/** @format */

import { inject, Injectable } from "@angular/core";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  profileRedirect(profileId?: number): void {
    if (!profileId) return;

    this.router
      .navigateByUrl(`/office/profile/${profileId}`)
      .then(() => this.logger.debug("Router Changed form ProfileEditComponent"));
  }
}
