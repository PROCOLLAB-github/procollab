/** @format */

import { Component } from "@angular/core";
import { BarComponent } from "../../../../social_platform/src/app/ui/components/bar/bar.component";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: "app-webinars",
  standalone: true,
  imports: [BarComponent, CommonModule, RouterModule],
  templateUrl: "./webinars.component.html",
  styleUrl: "./webinars.component.scss",
})
export class WebinarsComponent {}
