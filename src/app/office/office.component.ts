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
import { forkJoin, noop, Observable, pluck, Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Invite } from "./models/invite.model";
import { MemberService } from "./services/member.service";

@Component({
  selector: "app-office",
  templateUrl: "./office.component.html",
  styleUrls: ["./office.component.scss"],
})
export class OfficeComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private cdref: ChangeDetectorRef,
    private industryService: IndustryService,
    private memberService: MemberService,
    private route: ActivatedRoute
  ) {}

  invites$: Observable<Invite[]> = this.route.data.pipe(pluck("invites"));

  bodyHeight = "0px";
  @ViewChild("general") general?: ElementRef<HTMLElement>;

  hintsSub?: Subscription;

  ngOnInit(): void {
    this.hintsSub = forkJoin([
      this.industryService.getAll(),
      this.memberService.getSpecialities(),
    ]).subscribe(noop);
  }

  ngAfterViewInit(): void {
    if (this.general) {
      this.bodyHeight = `${window.screen.availHeight - this.general.nativeElement.clientHeight}px`;
      this.cdref.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.hintsSub?.unsubscribe();
  }
}
