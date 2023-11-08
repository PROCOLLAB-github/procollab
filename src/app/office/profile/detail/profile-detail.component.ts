/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { AuthService } from "@auth/services";
import { ChatService } from "@services/chat.service";
import { BreakpointObserver } from "@angular/cdk/layout";

@Component({
  selector: "app-profile-detail",
  templateUrl: "./profile-detail.component.html",
  styleUrls: ["./profile-detail.component.scss"],
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
