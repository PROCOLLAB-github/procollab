/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

/** Контейнер страниц ошибок с общим layout. */
@Component({
    selector: "app-error",
    templateUrl: "./error.component.html",
    styleUrl: "./error.component.scss",
    imports: [RouterLink, RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
