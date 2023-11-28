/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { Observable, map } from "rxjs";
import { ProjectCardComponent } from "../../../shared/project-card/project-card.component";
import { NgIf, NgFor, AsyncPipe } from "@angular/common";

@Component({
    selector: "app-projects",
    templateUrl: "./projects.component.html",
    styleUrl: "./projects.component.scss",
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        RouterLink,
        ProjectCardComponent,
        AsyncPipe,
    ],
})
export class ProfileProjectsComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, public readonly authService: AuthService) {}

  user?: Observable<User> = this.route.parent?.data.pipe(map(r => r["data"]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  ngOnInit(): void {}
}
