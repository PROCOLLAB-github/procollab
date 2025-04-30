/** @format */

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink, RouterModule } from "@angular/router";
import { BarComponent } from "@ui/components";

@Component({
  selector: "app-track-bussiness",
  standalone: true,
  imports: [CommonModule, BarComponent, RouterModule],
  templateUrl: "./track-bussiness.component.html",
  styleUrl: "./track-bussiness.component.scss",
})
export class TrackBussinessComponent {}
