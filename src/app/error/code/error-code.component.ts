/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { pluck } from "rxjs";

@Component({
  selector: "app-code",
  templateUrl: "./error-code.component.html",
  styleUrls: ["./error-code.component.scss"],
})
export class ErrorCodeComponent implements OnInit {
  errorCode = this.activatedRoute.params.pipe(pluck("code"));

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {}
}
