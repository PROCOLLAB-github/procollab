/** @format */

import { Component, HostListener, inject, Input, OnInit, signal } from "@angular/core";
import { CommonModule, NgClass, NgOptimizedImage, NgStyle } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { AvatarComponent, IconComponent } from "@uilib";
import { Router } from "@angular/router";
import { Profile } from "../../../../models/profile.model";
import { PluralizePipe } from "@corelib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProfileService } from "../../services/profile.service";

@Component({
  selector: "app-info-block",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    PluralizePipe,
    AvatarComponent,
    ModalComponent,
  ],
  templateUrl: "./info-block.component.html",
  styleUrl: "./info-block.component.scss",
})
export class InfoBlockComponent implements OnInit {
  router = inject(Router);
  profileService = inject(ProfileService);

  @Input({ required: true }) userData!: Profile["userData"];

  achievementsList = Array;

  avatarSize = signal(window.innerWidth > 1200 ? 165 : 90);
  openSuscriptionBought = false;

  ngOnInit(): void {
    const hasShownModal = localStorage.getItem("hasShownSubscriptionModal");

    if (!hasShownModal) {
      this.profileService.getSubscriptionData().subscribe({
        next: r => {
          this.openSuscriptionBought = r.lastSubscriptionType === null;
          if (this.openSuscriptionBought) {
            localStorage.setItem("hasShownSubscriptionModal", "true");
          }
        },
      });
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.avatarSize.set(event.target.innerWidth > 1200 ? 165 : 90);
  }
}
