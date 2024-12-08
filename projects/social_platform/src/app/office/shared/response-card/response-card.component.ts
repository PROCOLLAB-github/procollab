/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { VacancyResponse } from "@models/vacancy-response.model";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { ButtonComponent } from "@ui/components";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { RouterLink } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { AuthService } from "@auth/services";
import { map, tap } from "rxjs";

@Component({
  selector: "app-response-card",
  templateUrl: "./response-card.component.html",
  styleUrl: "./response-card.component.scss",
  standalone: true,
  imports: [
    RouterLink,
    AvatarComponent,
    TagComponent,
    ButtonComponent,
    UserRolePipe,
    AsyncPipe,
    FileItemComponent,
  ],
})
export class ResponseCardComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  @Input({ required: true }) response!: VacancyResponse;
  @Output() reject = new EventEmitter<number>();
  @Output() accept = new EventEmitter<number>();

  profileId!: number;

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: profile => {
        this.profileId = profile.id;
      },
    });
  }

  onAccept(responseId: number) {
    this.accept.emit(responseId);
  }

  onReject(responseId: number) {
    this.reject.emit(responseId);
  }
}
