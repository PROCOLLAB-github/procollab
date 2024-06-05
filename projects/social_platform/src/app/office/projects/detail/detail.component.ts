/** @format */

import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { map, Subscription } from "rxjs";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Project } from "@models/project.model";
import { AuthService } from "@auth/services";
import { BackComponent } from "@uilib";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [BackComponent, RouterLinkActive, RouterLink, RouterOutlet, AsyncPipe],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  @Input() project?: Project;

  constructor(private readonly route: ActivatedRoute, private readonly authService: AuthService) { }

  ngOnInit(): void {
    const projectSub$ = this.route.data.subscribe(r => {
      this.project = r['data'][0];
    });
    projectSub$ && this.subscriptions$.push(projectSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];

  isInProject$ = this.authService.profile.pipe(
    map(profile => this.project?.collaborators.map(person => person.userId).includes(profile.id))
  );
}
