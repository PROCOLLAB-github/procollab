/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { User } from "../../../auth/models/user.model";
import { NavService } from "../../services/nav.service";
import { AuthService } from "../../../auth/services";

@Component({
  selector: "app-profile-detail",
  templateUrl: "./profile-detail.component.html",
  styleUrls: ["./profile-detail.component.scss"],
})
export class ProfileDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private navService: NavService,
    public authService: AuthService
  ) {}

  user: Observable<User> = this.route.data.pipe(map(r => r["data"]));

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль");
  }
}
