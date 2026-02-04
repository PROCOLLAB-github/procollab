/** @format */

import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class NavigationService {
  private readonly router = inject(Router);

  profileRedirect(profileId?: number): void {
    if (!profileId) return;

    this.router
      .navigateByUrl(`/office/profile/${profileId}`)
      .then(() => console.debug("Router Changed form ProfileEditComponent"));
  }
}
