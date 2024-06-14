import { inject } from "@angular/core"
import { SubscriptionService } from "./service/subscription.service";
import { ProfileService } from "../profile/services/profile.service";

export const subscriptionResolver = () => {
  const subscriptionService = inject(SubscriptionService);
  return subscriptionService.getSubscriptions();
}

export const subscriptionDataResolver = () => {
  const profileService = inject(ProfileService);
  return profileService.getSubscriptionData()
}
