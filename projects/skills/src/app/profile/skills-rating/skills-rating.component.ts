/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PersonalRatingCardComponent } from "../shared/personal-rating-card/personal-rating-card.component";
import { Profile } from "projects/skills/src/models/profile.model";
import { ProfileService } from "../services/profile.service";
import { SkillService } from "../../skills/services/skill.service";
import { Skill } from "projects/skills/src/models/skill.model";

@Component({
  selector: "app-skills-rating",
  standalone: true,
  imports: [CommonModule, PersonalRatingCardComponent],
  templateUrl: "./skills-rating.component.html",
  styleUrl: "./skills-rating.component.scss",
})
export class ProfileSkillsRatingComponent implements OnInit {
  profileService = inject(ProfileService);
  skillService = inject(SkillService);

  skillsList: Profile["skills"] = [];

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((r: Profile) => {
      this.skillsList = r["skills"];
    });
  }
}
