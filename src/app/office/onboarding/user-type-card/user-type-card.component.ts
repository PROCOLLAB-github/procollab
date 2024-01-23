/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-user-type-card",
  templateUrl: "./user-type-card.component.html",
  styleUrl: "./user-type-card.component.scss",
  standalone: true,
})
export class UserTypeCardComponent implements OnInit {
  @Input() isActive = false;
  constructor() {}

  ngOnInit(): void {}
}
