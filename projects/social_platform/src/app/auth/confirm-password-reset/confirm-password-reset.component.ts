/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-confirm-password-reset",
  templateUrl: "./confirm-password-reset.component.html",
  styleUrl: "./confirm-password-reset.component.scss",
  standalone: true,
  imports: [AsyncPipe],
})
export class ConfirmPasswordResetComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {}

  email = this.route.queryParams.pipe(map(r => r["email"]));
}
