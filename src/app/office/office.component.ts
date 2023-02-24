/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
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
export class OfficeComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private cdref: ChangeDetectorRef,
    private industryService: IndustryService,
    private route: ActivatedRoute,
    public authService: AuthService,
    private projectService: ProjectService,
    private router: Router
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

  ngAfterViewInit(): void {
    if (this.general) {
      this.bodyHeight = `${window.innerHeight - this.general.nativeElement.clientHeight}px`;
      this.cdref.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  invites$: Observable<Invite[]> = this.route.data.pipe(
    map(r => r["invites"]),
    map(invites => invites.filter((invite: Invite) => invite.isAccepted === null))
  );

  bodyHeight = "0px";
  @ViewChild("general") general?: ElementRef<HTMLElement>;

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
