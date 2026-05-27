/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";

/** Страница ошибки 404. */
@Component({
  selector: "app-not-found",
  templateUrl: "./error-not-found.component.html",
  styleUrl: "./error-not-found.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorNotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
