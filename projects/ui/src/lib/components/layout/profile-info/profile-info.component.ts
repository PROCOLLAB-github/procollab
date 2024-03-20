/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { DayjsPipe } from "projects/core";
import { AvatarComponent, IconComponent } from "@uilib";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-profile-info",
  templateUrl: "./profile-info.component.html",
  styleUrl: "./profile-info.component.scss",
  standalone: true,
  imports: [RouterLink, AvatarComponent, IconComponent, DayjsPipe],
})
export class ProfileInfoComponent implements OnInit {
  constructor(readonly router: Router) {}

  ngOnInit(): void {}

  @Input({ required: true }) user!: User;
  @Output() logout = new EventEmitter<void>();
}
