/** @format */

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, Subscription } from "rxjs";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import Fuse from "fuse.js";
import { containerSm } from "@utils/responsive";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navService: NavService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Участники");

    this.members$ = combineLatest([
      this.route.data.pipe(map(r => r["data"])),
      this.authService.profile,
    ])
      .pipe(
        map(([members, profile]: [User[], User]) =>
          members.filter(member => member.id !== profile.id)
        )
      )
      .subscribe(members => {
        this.members = members;
        this.searchedMembers = members;
      });

    this.searchFormSearch$ = this.searchForm.get("search")?.valueChanges.subscribe(value => {
      const fuse = new Fuse(this.members, {
        keys: ["firstName", "lastName", "keySkills"],
      });

      this.searchedMembers = value ? fuse.search(value).map(el => el.item) : this.members;
    });
  }

  ngOnDestroy(): void {
    [this.members$, this.searchFormSearch$].forEach($ => $?.unsubscribe());
  }

  containerSm = containerSm;
  appWidth = window.innerWidth;

  members: User[] = [];
  searchedMembers: User[] = [];
  members$?: Subscription;

  searchForm: FormGroup;
  searchFormSearch$?: Subscription;
}
