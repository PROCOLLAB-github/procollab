/** @format */

import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { map, Observable } from "rxjs";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { AuthService } from "@auth/services";
import { ChatService } from "@services/chat.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { SubscriptionPlansService, YearsFromBirthdayPipe } from "projects/core";
import { BarComponent, ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { BackComponent } from "@uilib";
import { AsyncPipe } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";

@Component({
  selector: "app-profile-detail",
  templateUrl: "./profile-detail.component.html",
  styleUrl: "./profile-detail.component.scss",
  standalone: true,
  imports: [
    RouterLinkActive,
    RouterLink,
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    RouterOutlet,
    AsyncPipe,
    YearsFromBirthdayPipe,
    BarComponent,
    BackComponent,
    ModalComponent,
  ],
})
export class ProfileDetailComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly navService: NavService,
    public readonly authService: AuthService,
    public readonly subscriptionPlansService: SubscriptionPlansService,
    public readonly chatService: ChatService,
    public readonly breakpointObserver: BreakpointObserver
  ) {}

  user$: Observable<User> = this.route.data.pipe(map(r => r["data"][0]));
  loggedUserId$: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  linkData = "";

  isDelayModalOpen = false;
  isSended = false;
  isSubscriptionActive = false;

  errorMessageModal = signal("");
  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль");

    this.subscriptionPlansService
      .getSubscriptions()
      .pipe(
        map(r => {
          if (typeof r === "string") {
            return !!r;
          }
          return false;
        })
      )
      .subscribe(r => {
        this.isSubscriptionActive = r!;
      });
  }

  // downloadCV() {
  //   this.authService.downloadCV().subscribe({
  //     next: (response: Blob) => {
  //       // Создаем URL для Blob
  //       const blob = new Blob([response], { type: "application/pdf" });
  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = "download.pdf"; // Имя файла для скачивания
  //       link.click();
  //       window.URL.revokeObjectURL(link.href);
  //     },
  //     error: err => {
  //       if (err.status === 400) {
  //         this.errorMessageModal.set(err.error.slice(23, 25));
  //         this.isDelayModalOpen = true;
  //       }
  //     },
  //   });
  // }

  sendCVEmail() {
    this.authService.sendCV().subscribe({
      next: () => {
        this.isSended = true;
      },
      error: err => {
        if (err.status === 400) {
          this.isDelayModalOpen = true;
          this.errorMessageModal.set(err.error.seconds_after_retry);
        }
      },
    });
  }
}
