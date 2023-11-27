/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { IconComponent } from "../icon/icon.component";

@Component({
    selector: "app-back",
    templateUrl: "./back.component.html",
    styleUrl: "./back.component.scss",
    standalone: true,
    imports: [IconComponent],
})
export class BackComponent implements OnInit {
  constructor(private readonly router: Router, private readonly location: Location) {}

  @Input() path?: string;
  ngOnInit(): void {}

  onClick(): void {
    if (this.path) {
      this.router
        .navigateByUrl(this.path)
        .then(() => console.debug("Route changed from BackComponent"));
    } else {
      this.location.back();
    }
  }
}
