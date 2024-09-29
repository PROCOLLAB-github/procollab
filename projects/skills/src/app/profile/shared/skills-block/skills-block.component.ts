/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { PersonalRatingCardComponent } from "../personal-rating-card/personal-rating-card.component";
import { IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { SkillChooserComponent } from "../skill-chooser/skill-chooser.component";
import { ProfileService } from "../../services/profile.service";
import { Profile } from "projects/skills/src/models/profile.model";

@Component({
  selector: "app-skills-block",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    PersonalRatingCardComponent,
    NgOptimizedImage,
    IconComponent,
    RouterLink,
    SkillChooserComponent
  ],
  templateUrl: "./skills-block.component.html",
  styleUrl: "./skills-block.component.scss",
})
export class SkillsBlockComponent implements OnInit {
  open = false;
  profileService = inject(ProfileService);
  skillsList: Profile['skills'] = [];

  onOpenChange(open: boolean) {
    this.open = open;
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((r: Profile) => {
      this.skillsList = r['skills'];
    })
  }
}
