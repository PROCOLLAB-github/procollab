/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { LoaderComponent } from "../loader/loader.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.scss",
  standalone: true,
  imports: [CommonModule, LoaderComponent],
})
export class ButtonComponent implements OnInit {
  constructor() {}

  @Input() color: "primary" | "red" | "grey" | "green" | "gold" | "gradient" | "white" = "primary";
  @Input() loader = false;
  @Input() hasBorder = true;
  @Input() type: "submit" | "reset" | "button" = "button";
  @Input() appearance: "inline" | "outline" = "inline";
  @Input() backgroundColor?: string;
  @Input() disabled = false;
  @Input() customTypographyClass?: string;

  ngOnInit(): void {}
}
