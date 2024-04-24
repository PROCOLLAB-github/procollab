/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { tap } from "rxjs";
import { Profile } from "../../models/profile.model";
import { ProfileService } from "./services/profile.service";

export const profileResolver: ResolveFn<Profile> = () => {
  const profileService = inject(ProfileService);
  return profileService.getProfile().pipe(tap(console.log));
};
