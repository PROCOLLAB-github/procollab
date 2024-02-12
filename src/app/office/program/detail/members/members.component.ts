/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { concatMap, fromEvent, map, noop, Observable, of, tap, throttleTime } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { User } from "@auth/models/user.model";
import { ProgramService } from "@office/program/services/program.service";
import { MemberCardComponent } from "@office/shared/member-card/member-card.component";
import { ProgramHeadComponent } from "../../shared/program-head/program-head.component";
import { AsyncPipe } from "@angular/common";
import { ApiPagination } from "@models/api-pagination.model";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrl: "./members.component.scss",
  standalone: true,
  imports: [ProgramHeadComponent, RouterLink, MemberCardComponent, AsyncPipe],
})
export class ProgramMembersComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly cdref: ChangeDetectorRef,
    private readonly programService: ProgramService
  ) {}

  ngOnInit(): void {
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
          throttleTime(500)
        )
        .subscribe(noop);
  }

  program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));
  members$: Observable<User[]> = this.route.data.pipe(
    map(r => r["data"]),
    map(r => r["results"])
  );

  members: User[] = [];
  membersTotalCount?: number;
  membersPage = 1;
  membersTake = 20;
  @ViewChild("membersRoot") membersRoot?: ElementRef<HTMLUListElement>;

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
    return this.programService
      .getAllMembers(
        this.route.parent?.snapshot.params["programId"],
        this.membersPage * this.membersTake,
        this.membersTake
      )
      .pipe(
        tap((members: ApiPagination<User>) => {
          this.membersTotalCount = members.count;
          this.members = [...this.members, ...members.results];

          this.membersPage++;

          this.cdref.detectChanges();
        })
      );
  }
}
