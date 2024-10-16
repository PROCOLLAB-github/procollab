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
import { ModalComponent } from "@ui/components/modal/modal.component";
import { PersonalSkillCardComponent } from "../personal-skill-card/personal-skill-card.component";

@Component({
  selector: "app-skills-block",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    PersonalRatingCardComponent,
    PersonalSkillCardComponent,
    NgOptimizedImage,
    IconComponent,
    RouterLink,
    SkillChooserComponent,
    ModalComponent,
  ],
  templateUrl: "./skills-block.component.html",
  styleUrl: "./skills-block.component.scss",
})
export class SkillsBlockComponent implements OnInit {
  openSkillChoose = false;
  openInstruction = false;

  profileService = inject(ProfileService);
  skillsList: Profile["skills"] = [];

  onOpenSkillsChange(open: boolean) {
    this.openSkillChoose = open;
  }

  onOpenInstructionChange(open: boolean) {
    this.openSkillChoose = open;
  }

  nextStepModal() {
    this.openInstruction = false;
    this.openSkillChoose = true;
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((r: Profile) => {
      this.skillsList = r["skills"];
    });
  }
}
