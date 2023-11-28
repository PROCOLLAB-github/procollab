/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from "@angular/router";
import { map, Observable } from "rxjs";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { AuthService } from "@auth/services";
import { ChatService } from "@services/chat.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { YearsFromBirthdayPipe } from "../../../core/pipes/years-from-birthday.pipe";
import { ButtonComponent } from "../../../ui/components/button/button.component";
import { IconComponent } from "../../../ui/components/icon/icon.component";
import { AvatarComponent } from "../../../ui/components/avatar/avatar.component";
import { BackComponent } from "../../../ui/components/back/back.component";
import { NgIf, AsyncPipe } from "@angular/common";

@Component({
    selector: "app-profile-detail",
    templateUrl: "./profile-detail.component.html",
    styleUrl: "./profile-detail.component.scss",
    standalone: true,
    imports: [
        NgIf,
        BackComponent,
        RouterLinkActive,
        RouterLink,
        AvatarComponent,
        IconComponent,
        ButtonComponent,
        RouterOutlet,
        AsyncPipe,
        YearsFromBirthdayPipe,
    ],
})
export class ProfileDetailComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly navService: NavService,
    public readonly authService: AuthService,
    public readonly chatService: ChatService,
    public readonly breakpointObserver: BreakpointObserver
  ) {}

  user$: Observable<User> = this.route.data.pipe(map(r => r["data"]));
  loggedUserId$: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль");
  }
}
