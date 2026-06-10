/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map } from "rxjs";
import { AsyncPipe } from "@angular/common";

/** Отображает страницу ошибки с динамическим кодом из URL. */
@Component({
  selector: "app-code",
  templateUrl: "./error-code.component.html",
  styleUrl: "./error-code.component.scss",
  imports: [RouterLink, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorCodeComponent implements OnInit {
  // Observable с кодом ошибки, извлеченным из URL параметра 'code'
  errorCode = this.activatedRoute.params.pipe(map(r => r["code"]));

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {}
}
