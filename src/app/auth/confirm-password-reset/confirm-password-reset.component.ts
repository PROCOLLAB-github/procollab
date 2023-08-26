/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";

@Component({
  selector: "app-confirm-password-reset",
  templateUrl: "./confirm-password-reset.component.html",
  styleUrls: ["./confirm-password-reset.component.scss"],
})
export class ConfirmPasswordResetComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {}

  email = this.route.queryParams.pipe(map(r => r["email"]));
}
