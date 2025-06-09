/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { InfoBlockComponent } from "./shared/info-block/info-block.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { BarComponent } from "@ui/components";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, RouterOutlet, InfoBlockComponent, BarComponent],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
  route = inject(ActivatedRoute);

  profileData = toSignal(this.route.data.pipe(map(r => r["data"])));
}
