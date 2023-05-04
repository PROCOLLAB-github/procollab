/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-user-type-card",
  templateUrl: "./user-type-card.component.html",
  styleUrls: ["./user-type-card.component.scss"],
})
export class UserTypeCardComponent implements OnInit {
  @Input() isActive = false;
  constructor() {}

  ngOnInit(): void {}
}
