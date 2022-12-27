/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../../auth/models/user.model";
import { containerSm } from "../../../utils/responsive";

@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrls: ["./member-card.component.scss"],
})
export class MemberCardComponent implements OnInit {
  constructor() {}

  @Input() user!: User;

  ngOnInit(): void {}

  containerSm = containerSm;

  appWidth = window.innerWidth;
}
