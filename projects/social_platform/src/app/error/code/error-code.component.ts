/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map } from "rxjs";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-code",
  templateUrl: "./error-code.component.html",
  styleUrl: "./error-code.component.scss",
  standalone: true,
  imports: [RouterLink, AsyncPipe],
})
export class ErrorCodeComponent implements OnInit {
  errorCode = this.activatedRoute.params.pipe(map(r => r["code"]));

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {}
}
