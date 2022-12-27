/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../../auth/models/user.model";

@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrls: ["./member-card.component.scss"],
})
export class MemberCardComponent implements OnInit {
  constructor() {}

  @Input() user!: User;

  ngOnInit(): void {}

  appWidth = window.innerWidth;
}
