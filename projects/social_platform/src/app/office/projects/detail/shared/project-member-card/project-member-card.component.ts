/** @format */

import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from "@angular/cdk/menu";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Collaborator } from "@office/models/collaborator.model";
import { AvatarComponent, IconComponent } from "@uilib";

@Component({
  selector: "app-project-member-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    AvatarComponent,
    CdkMenuTrigger,
    CdkMenuItem,
    CdkMenu,
  ],
  templateUrl: "./project-member-card.component.html",
  styleUrl: "./project-member-card.component.scss",
})
export class ProjectMemberCardComponent {
  @Input({ required: true }) member!: Collaborator;
  @Input() isLeader = false;

  @Output() remove = new EventEmitter<Collaborator["userId"]>();
  @Output() transferOwnership = new EventEmitter<Collaborator["userId"]>();
}
