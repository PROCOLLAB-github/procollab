/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";
import { InfoBlockComponent } from "./shared/info-block/info-block.component";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule,
    BackComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    InfoBlockComponent,
  ],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent {}
