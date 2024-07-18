/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { containerSm } from "@utils/responsive";
import { MemberService } from "@services/member.service";
import { MemberCardComponent } from "../shared/member-card/member-card.component";
import { ApiPagination } from "@models/api-pagination.model";

@Component({
  selector: "app-mentors",
  templateUrl: "./mentors.component.html",
  styleUrl: "./mentors.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, MemberCardComponent],
})
export class MentorsComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly navService: NavService,
    private readonly fb: FormBuilder,
    private readonly memberService: MemberService,
    private readonly cdref: ChangeDetectorRef,
  ) {
    this.searchForm = this.fb.group({
      search: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Участники");

    this.route.data.pipe(map(r => r["data"])).subscribe((members: ApiPagination<User>) => {
      this.membersTotalCount = members.count;

      this.members = members.results;
    });
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target)
      fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500),
        )
        .subscribe(noop);
  }

  ngOnDestroy(): void {
    [this.members$, this.searchFormSearch$].forEach($ => $?.unsubscribe());
  }

  containerSm = containerSm;
  appWidth = window.innerWidth;

  @ViewChild("membersRoot") membersRoot?: ElementRef<HTMLUListElement>;
  membersTotalCount?: number;
  membersPage = 1;
  membersTake = 20;

  members: User[] = [];
  members$?: Subscription;

  searchForm: FormGroup;
  searchFormSearch$?: Subscription;

  onScroll() {
    if (this.membersTotalCount && this.members.length >= this.membersTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.membersRoot) return of({});

    const diff =
      target.scrollTop -
      this.membersRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      return this.onFetch();
    }

    return of({});
  }

  onFetch() {
    return this.memberService
      .getMentors(this.membersPage * this.membersTake, this.membersTake)
      .pipe(
        tap((members: ApiPagination<User>) => {
          this.membersTotalCount = members.count;
          this.members = [...this.members, ...members.results];

          this.membersPage++;

          this.cdref.detectChanges();
        }),
      );
  }
}
