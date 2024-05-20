/** @format */

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent, IconComponent } from "@uilib";
import { DayjsPipe } from "@corelib";
import { User } from "../../../../../ui/src/lib/models/user.model";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-sidebar-profile",
  standalone: true,
  imports: [CommonModule, IconComponent, AvatarComponent, DayjsPipe, RouterLink],
  templateUrl: "./sidebar-profile.component.html",
  styleUrl: "./sidebar-profile.component.scss",
})
export class SidebarProfileComponent {
  @Input({ required: true }) user!: User;

  @Output() logout = new EventEmitter();
}
