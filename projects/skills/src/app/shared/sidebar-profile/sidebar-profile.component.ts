/** @format */

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent, IconComponent } from "@uilib";
import { DayjsPipe } from "@corelib";
import { RouterLink } from "@angular/router";
import { Profile } from "projects/skills/src/models/profile.model";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-sidebar-profile",
  standalone: true,
  imports: [CommonModule, IconComponent, AvatarComponent, DayjsPipe, RouterLink],
  templateUrl: "./sidebar-profile.component.html",
  styleUrl: "./sidebar-profile.component.scss",
})
export class SidebarProfileComponent {
  @Input({ required: true }) user?: Profile['userData'];

  @Output() logout = new EventEmitter();
}
