/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";

@Component({
  selector: "app-code",
  templateUrl: "./error-code.component.html",
  styleUrl: "./error-code.component.scss",
})
export class ErrorCodeComponent implements OnInit {
  errorCode = this.activatedRoute.params.pipe(map(r => r["code"]));

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {}
}
