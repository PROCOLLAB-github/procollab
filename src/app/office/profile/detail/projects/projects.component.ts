/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { Observable, map } from "rxjs";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProfileProjectsComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, public readonly authService: AuthService) {}

  user?: Observable<User> = this.route.parent?.data.pipe(map(r => r["data"]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  ngOnInit(): void {}
}
