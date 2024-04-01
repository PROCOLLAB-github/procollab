/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, BackComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent {}
