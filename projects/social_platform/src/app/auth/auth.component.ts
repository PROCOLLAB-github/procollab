/** @format */

import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.scss",
  standalone: true,
  imports: [RouterOutlet],
})
export class AuthComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
