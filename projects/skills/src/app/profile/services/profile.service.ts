/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService, SubscriptionData } from "@corelib";
import { Profile, UserData } from "../../../models/profile.model";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  apiService = inject(ApiService);

  getProfile() {
    return this.apiService.get<Profile>("/progress/profile/");
  }

  getUserData() {
    return this.apiService.get<UserData>("/progress/user-data/");
  }

  getSubscriptionData() {
    return this.apiService.get<SubscriptionData>("/progress/subscription-data/");
  }

  updateSubscriptionDate(allowed: boolean) {
    return this.apiService.patch("/progress/update-auto-renewal/", {
      is_autopay_allowed: allowed,
    });
  }

  cancelSubscription() {
    return this.apiService.post("/subscription/refund", {});
  }

  addSkill(skills: number[]) {
    return this.apiService.patch("/progress/add-skills/", skills);
  }
}
