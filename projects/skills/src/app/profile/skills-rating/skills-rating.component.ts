/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PersonalRatingCardComponent } from "../shared/personal-rating-card/personal-rating-card.component";
import { Profile } from "projects/skills/src/models/profile.model";
import { ProfileService } from "../services/profile.service";

@Component({
  selector: "app-skills-rating",
  standalone: true,
  imports: [CommonModule, PersonalRatingCardComponent],
  templateUrl: "./skills-rating.component.html",
  styleUrl: "./skills-rating.component.scss",
})
export class ProfileSkillsRatingComponent implements OnInit {
  profileService = inject(ProfileService);
  skillsList: Profile["skills"] = [];

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((r: Profile) => {
      this.skillsList = r["skills"];
    });
  }
}
