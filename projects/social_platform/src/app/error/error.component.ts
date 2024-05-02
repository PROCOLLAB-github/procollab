/** @format */

import { Component, OnInit } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-error",
  templateUrl: "./error.component.html",
  styleUrl: "./error.component.scss",
  standalone: true,
  imports: [RouterLink, RouterOutlet],
})
export class ErrorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
