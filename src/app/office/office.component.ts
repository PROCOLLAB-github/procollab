/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { IndustryService } from "@services/industry.service";
import { forkJoin, map, noop, Observable, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Invite } from "@models/invite.model";
import { AuthService } from "@auth/services";
import { ProjectService } from "@services/project.service";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-office",
  templateUrl: "./office.component.html",
  styleUrls: ["./office.component.scss"],
})
export class OfficeComponent implements OnInit, OnDestroy {
  constructor(
    private readonly industryService: IndustryService,
    private readonly route: ActivatedRoute,
    public readonly authService: AuthService,
    private readonly projectService: ProjectService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const globalSubscription$ = forkJoin([
      this.industryService.getAll(),
      this.projectService.getProjectSteps(),
    ]).subscribe(noop);
    this.subscriptions$.push(globalSubscription$);

    const profileSub$ = this.authService.profile.subscribe(profile => {
      this.profile = profile;

      if (!this.profile.doesCompleted()) {
        this.completeProfileModal = true;
      }
    });
    this.subscriptions$.push(profileSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  invites$: Observable<Invite[]> = this.route.data.pipe(
    map(r => r["invites"]),
    map(invites => invites.filter((invite: Invite) => invite.isAccepted === null))
  );

  subscriptions$: Subscription[] = [];

  completeProfileModal = false;
  profile?: User;

  onGotoProfile(): void {
    if (!this.profile) return;

    this.completeProfileModal = false;

    this.router
      .navigateByUrl(`/office/profile/${this.profile.id}`)
      .then(() => console.debug("Route changed OfficeComponent"));
  }
}
