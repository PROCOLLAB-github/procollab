/** @format */

import { Component, inject, Input } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { AvatarComponent, IconComponent } from "@uilib";
import { Router, RouterLink } from "@angular/router";
import { Profile } from "../../../../models/profile.model";
import { PluralizePipe } from "@corelib";

@Component({
  selector: "app-info-block",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    RouterLink,
    NgOptimizedImage,
    PluralizePipe,
    AvatarComponent,
  ],
  templateUrl: "./info-block.component.html",
  styleUrl: "./info-block.component.scss",
})
export class InfoBlockComponent {
  router = inject(Router);

  @Input({ required: true }) userData!: Profile["userData"];

  achievementsList = Array;
  protected readonly window = window;
}
