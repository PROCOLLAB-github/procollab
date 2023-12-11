/** @format */

import { Component, OnInit } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-not-found",
  templateUrl: "./error-not-found.component.html",
  styleUrl: "./error-not-found.component.scss",
  standalone: true,
  imports: [NgOptimizedImage],
})
export class ErrorNotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
