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
import { ActivatedRoute, Router } from "@angular/router";
import {
  BehaviorSubject,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  noop,
  Observable,
  of,
  skip,
  Subscription,
  switchMap,
  take,
  tap,
  throttleTime,
} from "rxjs";
import { MembersResult, User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { containerSm } from "@utils/responsive";
import { MemberService } from "@services/member.service";
import { capitalizeString } from "@utils/capitalize-string";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly navService: NavService,
    private readonly fb: UntypedFormBuilder,
    private readonly memberService: MemberService,
    private readonly cdref: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      search: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Участники");

    this.route.data
      .pipe(
        take(1),
        map(r => r["data"])
      )
      .subscribe((members: MembersResult) => {
        this.membersTotalCount = members.count;

        this.members = members.results;
      });

    this.searchFormChanges$ = this.searchForm.get("search")?.valueChanges.subscribe(search => {
      this.router
        .navigate([], {
          queryParams: { search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from MembersComponent"));
    });

    this.querySearch$ = this.searchParam$
      .pipe(
        tap(search => {
          this.searchParamSubject$.next(search);
        }),
        switchMap(search => {
          let request: Observable<User[]>;
          if (!search) {
            request = this.onFetch(0, 20).pipe(take(1));
          } else {
            request = this.onFetch(0, 20, { fullname: search }).pipe(take(1));
          }
          request.subscribe(members => {
            this.members = members;
            this.membersPage = 1;

            this.cdref.detectChanges();
          });
          return of({});
        })
      )
      .subscribe(noop);
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target)
      this.scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);
  }

  ngOnDestroy(): void {
    [this.searchFormChanges$, this.querySearch$, this.scrollEvents$].forEach($ => $?.unsubscribe());
  }

  containerSm = containerSm;
  appWidth = window.innerWidth;

  @ViewChild("membersRoot") membersRoot?: ElementRef<HTMLUListElement>;
  membersTotalCount?: number;
  membersPage = 1;
  membersTake = 20;

  members: User[] = [];

  querySearch$?: Subscription;

  searchParam$ = this.route.queryParams.pipe(
    skip(1),
    debounceTime(500),
    map(q => {
      if (q["search"]) {
        return capitalizeString(q["search"] as string);
      }
      return q["search"];
    }),
    distinctUntilChanged()
  );

  searchParamSubject$ = new BehaviorSubject<string>("");

  searchForm: UntypedFormGroup;
  searchFormChanges$?: Subscription;

  scrollEvents$?: Subscription;

  onScroll() {
    if (this.membersTotalCount && this.members.length >= this.membersTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.membersRoot) return of({});

    const diff =
      target.scrollTop -
      this.membersRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      const search = { fullname: this.searchParamSubject$.value };
      return this.onFetch(this.membersPage * this.membersTake, this.membersTake, search).pipe(
        tap(membersChunk => {
          this.membersPage++;
          this.members = [...this.members, ...membersChunk];

          this.cdref.detectChanges();
        })
      );
    }

    return of({});
  }

  onFetch(skip: number, take: number, params?: Record<string, string | number | boolean>) {
    return this.memberService.getMembers(skip, take, params).pipe(
      map((members: MembersResult) => {
        this.membersTotalCount = members.count;

        return members.results;
      })
    );
  }
}
