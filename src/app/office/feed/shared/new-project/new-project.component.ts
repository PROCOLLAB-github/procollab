/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: "app-new-project",
  standalone: true,
  imports: [CommonModule, ButtonComponent, AvatarComponent, RouterLink],
  templateUrl: "./new-project.component.html",
  styleUrl: "./new-project.component.scss",
})
export class NewProjectComponent {
  constructor(public readonly router: Router) {}
}
