/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { map, Observable } from "rxjs";
import { ProjectCardComponent } from "@office/shared/project-card/project-card.component";
import { AsyncPipe } from "@angular/common";
import { Project } from "@office/models/project.model";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  standalone: true,
  imports: [RouterLink, ProjectCardComponent, AsyncPipe],
})
export class ProfileProjectsComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, public readonly authService: AuthService) {}

  user?: Observable<User> = this.route.parent?.data.pipe(map(r => r["data"][0]));
  subs?: Observable<Project[]> = this.route.parent?.data.pipe(map(r => r["data"][1]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  ngOnInit(): void {}
}
