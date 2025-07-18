/** @format */

import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map, Subscription } from "rxjs";
import { ProfileService } from "../profile/services/profile.service";
import { SubscriptionData, SubscriptionPlan, SubscriptionPlansService } from "@corelib";

@Component({
  selector: "app-subscription",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, SwitchComponent, ModalComponent],
  templateUrl: "./subscription.component.html",
  styleUrl: "./subscription.component.scss",
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  open = signal(false);
  autoRenewModalOpen = signal(false);

  route = inject(ActivatedRoute);
  profileService = inject(ProfileService);
  subscriptionService = inject(SubscriptionPlansService);

  isSubscribedModalOpen = signal(false);

  subscriptions = signal<SubscriptionPlan[]>([]);
  subscriptionData = toSignal<SubscriptionData>(
    this.route.data.pipe(map(r => r["subscriptionData"]))
  );

  isSubscribed = toSignal<SubscriptionData>(
    this.route.data.pipe(map(r => r["subscriptionData"].isSubscribed))
  );

  subscription: Subscription[] = [];

  ngOnInit(): void {
    const subsriptionPlanSub = this.route.data
      .pipe(map(r => r["data"]))
      .pipe(
        map(subscription => {
          if (Array.isArray(subscription)) {
            return subscription;
          } else return [subscription];
        })
      )
      .pipe(map(subs => subs.sort((a, b) => a.price - b.price)))
      .subscribe(subscriptions => {
        this.subscriptions.set(subscriptions);
      });

    this.subscription.push(subsriptionPlanSub);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  onOpenChange(event: boolean) {
    if ((this.open() && !event) || (this.autoRenewModalOpen() && !event)) {
      this.open.set(false);
      this.autoRenewModalOpen.set(false);
    } else {
      this.open.set(event);
      this.autoRenewModalOpen.set(event);
    }
  }

  onCheckedChange() {
    if (this.subscriptionData()?.isAutopayAllowed) {
      this.profileService.updateSubscriptionDate(false).subscribe(() => {
        const updatedData = this.subscriptionData()!;
        updatedData.isAutopayAllowed = false;
      });
    } else {
      this.autoRenewModalOpen.set(true);
    }
  }

  onCancelModalClose(event: boolean) {
    if (!event) this.open.set(false);
  }

  onAutoRenewModalClose(event: boolean) {
    if (!event) this.autoRenewModalOpen.set(false);
  }

  openCancelModal() {
    this.open.set(true);
  }

  onConfirmAutoPlay(event: boolean) {
    this.profileService.updateSubscriptionDate(event).subscribe(() => {
      if (this.subscriptionData()) {
        const updatedData = this.subscriptionData()!;
        updatedData.isAutopayAllowed = event;
        this.autoRenewModalOpen.set(false);
        this.open.set(false);
      }
    });
  }

  onCancelSubscription() {
    this.profileService.cancelSubscription().subscribe({
      next: () => {
        this.open.set(false);
        location.reload();
      },
      error: () => {
        this.open.set(false);
        location.reload();
      },
    });
  }

  onBuyClick(planId: SubscriptionPlan["id"]) {
    if (!this.isSubscribed()) {
      this.subscriptionService.buySubscription(planId).subscribe(status => {
        location.href = status.confirmation.confirmationUrl;
      });
    } else {
      this.isSubscribedModalOpen.set(true);
    }
  }
}
