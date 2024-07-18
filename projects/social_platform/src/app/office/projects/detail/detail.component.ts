/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { map, Subscription } from "rxjs";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Project } from "@models/project.model";
import { AuthService } from "@auth/services";
import { BackComponent } from "@uilib";
import { AsyncPipe } from "@angular/common";
import { BarComponent } from "@ui/components";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [RouterLinkActive, RouterLink, RouterOutlet, AsyncPipe, BarComponent, BackComponent],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const projectSub$ = this.route.data.pipe(map(r => r["data"][0])).subscribe(project => {
      this.project = project;
    });
    projectSub$ && this.subscriptions$.push(projectSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];

  project?: Project;

  isInProject$ = this.authService.profile.pipe(
    map(profile => this.project?.collaborators.map(person => person.userId).includes(profile.id)),
  );
}
