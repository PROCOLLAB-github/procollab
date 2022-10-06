/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { pluck } from "rxjs";

@Component({
  selector: "app-email-verification",
  templateUrl: "./email-verification.component.html",
  styleUrls: ["./email-verification.component.scss"],
})
export class EmailVerificationComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  userEmail = this.route.queryParams.pipe(pluck("email"));

  ngOnInit(): void {}
}
