/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../../auth/models/user.model";
import { AuthService } from "../../../auth/services";
import { map } from "rxjs";

@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrls: ["./member-card.component.scss"],
})
export class MemberCardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  @Input() user!: User;

  userRole$ = this.authService.roles.pipe(
    map(roles => roles.find(role => role.id === this.user.userType)?.name)
  );

  ngOnInit(): void {}
}
