/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, pluck } from "rxjs";
import { AuthService } from "../../auth/services";
import { User } from "../../auth/models/user.model";
import { NavService } from "../services/nav.service";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navService: NavService
  ) {}

  members$ = combineLatest([this.route.data.pipe(pluck("data")), this.authService.profile]).pipe(
    map(([members, profile]: [User[], User]) => members.filter(member => member.id !== profile.id))
  );

  ngOnInit(): void {
    this.navService.setNavTitle("Участники");
  }
}
