/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { VacancyResponse } from "@models/vacancy-response.model";
import { UserRolePipe } from "../../../core/pipes/user-role.pipe";
import { ButtonComponent } from "../../../ui/components/button/button.component";
import { TagComponent } from "../../../ui/components/tag/tag.component";
import { AvatarComponent } from "../../../ui/components/avatar/avatar.component";
import { RouterLink } from "@angular/router";
import { NgIf, NgFor, AsyncPipe } from "@angular/common";

@Component({
    selector: "app-response-card",
    templateUrl: "./response-card.component.html",
    styleUrl: "./response-card.component.scss",
    standalone: true,
    imports: [
        NgIf,
        RouterLink,
        AvatarComponent,
        NgFor,
        TagComponent,
        ButtonComponent,
        UserRolePipe,
        AsyncPipe,
    ],
})
export class ResponseCardComponent implements OnInit {
  constructor() {}

  @Input() response?: VacancyResponse;
  @Output() reject = new EventEmitter<number>();
  @Output() accept = new EventEmitter<number>();

  ngOnInit(): void {}
}
