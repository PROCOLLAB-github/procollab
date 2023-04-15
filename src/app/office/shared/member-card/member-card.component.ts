/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "@auth/models/user.model";
import { containerSm } from "@utils/responsive";
import * as RelativeTime from "dayjs/plugin/relativeTime";
import * as dayjs from "dayjs";

dayjs.extend(RelativeTime);

@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrls: ["./member-card.component.scss"],
})
export class MemberCardComponent implements OnInit {
  constructor() {}

  @Input() user!: User;

  ngOnInit(): void {
    this.yearsOld = parseInt(dayjs(this.user.birthday).fromNow(true));
  }

  yearsOld?: number;

  containerSm = containerSm;

  appWidth = window.innerWidth;
}
