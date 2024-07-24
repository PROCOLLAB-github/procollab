/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "@auth/models/user.model";
import { YearsFromBirthdayPipe } from "projects/core";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AsyncPipe } from "@angular/common";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";

@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrl: "./member-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, TagComponent, AsyncPipe, UserRolePipe, YearsFromBirthdayPipe],
})
export class MemberCardComponent implements OnInit {
  constructor() { }

  @Input({ required: true }) user!: User;

  ngOnInit(): void { }
}
