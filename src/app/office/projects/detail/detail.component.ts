/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { map, Subscription } from "rxjs";
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from "@angular/router";
import { Project } from "@models/project.model";
import { AuthService } from "@auth/services";
import { BackComponent } from "@ui/components/back/back.component";
import { NgIf, AsyncPipe } from "@angular/common";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [NgIf, BackComponent, RouterLinkActive, RouterLink, RouterOutlet, AsyncPipe],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  constructor(private readonly route: ActivatedRoute, private readonly authService: AuthService) {}

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
    map(profile => this.project?.collaborators.map(person => person.userId).includes(profile.id))
  );
}
