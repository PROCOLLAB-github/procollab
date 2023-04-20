/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";

@Component({
  selector: "app-email-verification",
  templateUrl: "./email-verification.component.html",
  styleUrls: ["./email-verification.component.scss"],
})
export class EmailVerificationComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {}

  userEmail = this.route.queryParams.pipe(map(r => r["email"]));

  onResend(): void {}
}
