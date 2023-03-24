/** @format */

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Subscription } from "rxjs";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import Fuse from "fuse.js";
import { containerSm } from "@utils/responsive";

@Component({
  selector: "app-members",
  templateUrl: "./mentors.component.html",
  styleUrls: ["./mentors.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly navService: NavService,
    private readonly fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Менторы");

    this.members$ = this.route.data.pipe(map(r => r["data"])).subscribe(members => {
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
