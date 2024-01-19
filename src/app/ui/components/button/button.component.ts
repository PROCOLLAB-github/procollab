/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { LoaderComponent } from "../loader/loader.component";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.scss",
  standalone: true,
  imports: [NgClass, LoaderComponent],
})
export class ButtonComponent implements OnInit {
  constructor() {}

  @Input() color: "primary" | "red" | "grey" = "primary";
  @Input() loader = false;
  @Input() type: "submit" | "reset" | "button" = "button";
  @Input() appearance: "inline" | "outline" = "inline";
  @Input() customTypographyClass?: string;

  ngOnInit(): void {}
}
