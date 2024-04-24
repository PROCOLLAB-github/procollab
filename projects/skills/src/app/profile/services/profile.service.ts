/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Profile } from "../../../models/profile.model";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  apiService = inject(ApiService);

  getProfile() {
    return this.apiService.get<Profile>("/progress/profile/");
  }
}
