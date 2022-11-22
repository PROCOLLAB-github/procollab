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
import { IndustryService } from "./services/industry.service";
import { forkJoin, map, noop, Observable, Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Invite } from "./models/invite.model";
import { AuthService } from "../auth/services";
import { ProjectService } from "./services/project.service";

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
    private authService: AuthService,
    private projectService: ProjectService
  ) {}

  invites$: Observable<Invite[]> = this.route.data.pipe(
    map(r => r["invites"]),
    map(invites => invites.filter((invite: Invite) => invite.isAccepted === null))
  );

  bodyHeight = "0px";
  @ViewChild("general") general?: ElementRef<HTMLElement>;

  dictSub$?: Subscription;

  ngOnInit(): void {
    this.dictSub$ = forkJoin([
      this.industryService.getAll(),
      this.projectService.getProjectSteps(),
    ]).subscribe(noop);
  }

  ngAfterViewInit(): void {
    if (this.general) {
      this.bodyHeight = `${window.innerHeight - this.general.nativeElement.clientHeight}px`;
      this.cdref.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.dictSub$?.unsubscribe();
  }
}
