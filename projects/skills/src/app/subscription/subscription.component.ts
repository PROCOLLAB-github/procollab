/** @format */

import { Component, OnInit, inject, signal } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { ProfileService } from "../profile/services/profile.service";

@Component({
  selector: "app-subscription",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, SwitchComponent, ModalComponent],
  templateUrl: "./subscription.component.html",
  styleUrl: "./subscription.component.scss",
})
export class SubscriptionComponent {
  open = signal(false);
  checked = signal(false);

  route = inject(ActivatedRoute);
  profileService = inject(ProfileService);

  subscriptions = toSignal(this.route.data.pipe(map(r => r["data"])));
  subscriptionData = toSignal(this.route.data.pipe(map(r => r["subscriptionData"])));

  onOpenChange(event: boolean) {
    if (this.open() && !event) {
      this.open.set(false);
    } else {
      this.open.set(event);
    }
  }

  onCheckedChange(event: boolean) {
    if (this.subscriptionData().isAutopayAllowed) {
      this.profileService.updateSubscriptionDate(false).subscribe(() => {
        const updatedData = this.subscriptionData();
        updatedData.isAutopayAllowed = false;
      });
    } else this.checked.set(true);
  }

  onCloseModal() {
    this.open.set(false);
    this.checked.set(false);
  }

  onConfirmAutoPlay(event: boolean) {
    this.profileService.updateSubscriptionDate(event).subscribe(() => {
      const updatedData = this.subscriptionData();
      updatedData.isAutopayAllowed = event;
      this.checked.set(false);
      this.open.set(false);
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
}
