/** @format */

import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";
import { InfoBlockComponent } from "./shared/info-block/info-block.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { Profile } from "../../models/profile.model";

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
export class ProfileComponent implements OnInit {
  @Input() profileData!: Profile;
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.profileData = r['data']
    });
  }
}
