/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";
import { InfoBlockComponent } from "./shared/info-block/info-block.component";
import { ProfileService } from "./services/profile.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

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
export class ProfileComponent {
  route = inject(ActivatedRoute);

  profileData = toSignal(this.route.data.pipe(map(r => r["data"])));
}
