/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";

/** Корневой компонент страниц аутентификации с router-outlet. */
@Component({
    selector: "app-auth",
    templateUrl: "./auth.component.html",
    styleUrl: "./auth.component.scss",
    imports: [RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
