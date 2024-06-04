/** @format */

import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoBlockComponent } from "../shared/info-block/info-block.component";
import { MonthBlockComponent } from "../shared/month-block/month-block.component";
import { SkillsBlockComponent } from "../shared/skills-block/skills-block.component";
import { ProgressBlockComponent } from "../shared/progress-block/progress-block.component";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { Profile } from "projects/skills/src/models/profile.model";

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [
    CommonModule,
    InfoBlockComponent,
    MonthBlockComponent,
    SkillsBlockComponent,
    ProgressBlockComponent,
    RouterOutlet,
  ],
  templateUrl: "./profile-home.component.html",
  styleUrl: "./profile-home.component.scss",
})
export class ProfileHomeComponent implements OnInit {
  @Input() profileData!: Profile;
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.profileData = r['data'];
    })
  }
}
