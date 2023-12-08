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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  BehaviorSubject,
  concatMap,
  fromEvent,
  map,
  noop,
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
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { containerSm } from "@utils/responsive";
import { MemberService } from "@services/member.service";
import { MemberCardComponent } from "../shared/member-card/member-card.component";
import { CommonModule } from "@angular/common";
import { SearchComponent } from "@ui/components/search/search.component";
import { MembersFiltersComponent } from "./filters/members-filters.component";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrl: "./members.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SearchComponent,
    CommonModule,
    RouterLink,
    MemberCardComponent,
    MembersFiltersComponent,
  ],
})
export class MembersComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly navService: NavService,
    private readonly fb: FormBuilder,
    private readonly memberService: MemberService,
    private readonly cdref: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      search: ["", [Validators.required]],
    });

    this.filterForm = this.fb.group({
      keySkill: ["", Validators.required],
      age: [[null, null]],
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

    this.saveControlValue(this.searchForm.get("search"), "fullname");
    this.saveControlValue(this.filterForm.get("keySkill"), "key_skills__contains");

    this.route.queryParams
      .pipe(
        skip(1),
        switchMap(params => {
          const fetchParams: Record<string, string> = {};

          if (params["fullname"]) fetchParams["fullname"] = params["fullname"];
          if (params["key_skills__contains"])
            fetchParams["key_skills__contains"] = params["key_skills__contains"];

          this.searchParamsSubject$.next(fetchParams);
          return this.onFetch(0, 20, fetchParams);
        })
      )
      .subscribe(members => {
        this.members = members;
        this.membersPage = 1;

        this.cdref.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);

      this.subscriptions$.push(scrollEvents$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  containerSm = containerSm;
  appWidth = window.innerWidth;

  @ViewChild("membersRoot") membersRoot?: ElementRef<HTMLUListElement>;
  membersTotalCount?: number;
  membersPage = 1;
  membersTake = 20;

  subscriptions$: Subscription[] = [];

  members: User[] = [];

  searchParamsSubject$ = new BehaviorSubject<Record<string, string>>({});

  searchForm: FormGroup;
  filterForm: FormGroup;

  onScroll() {
    if (this.membersTotalCount && this.members.length >= this.membersTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.membersRoot) return of({});

    const diff =
      target.scrollTop -
      this.membersRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      return this.onFetch(
        this.membersPage * this.membersTake,
        this.membersTake,
        this.searchParamsSubject$.value
      ).pipe(
        tap(membersChunk => {
          this.membersPage++;
          this.members = [...this.members, ...membersChunk];

          this.cdref.detectChanges();
        })
      );
    }

    return of({});
  }

  /**
   * save value of form control in query params
   * @param control
   * @param queryName
   */
  saveControlValue(control: AbstractControl | null, queryName: string): void {
    if (!control) return;

    const sub$ = control.valueChanges.subscribe(value => {
      this.router
        .navigate([], {
          queryParams: { [queryName]: value },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from MembersComponent"));
    });

    this.subscriptions$.push(sub$);
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
