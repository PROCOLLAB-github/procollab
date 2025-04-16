/** @format */

import { Component, computed, HostListener, inject, OnInit, signal } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { PersonalRatingCardComponent } from "../personal-rating-card/personal-rating-card.component";
import { IconComponent } from "@uilib";
import { Router, RouterLink } from "@angular/router";
import { SkillChooserComponent } from "../skill-chooser/skill-chooser.component";
import { ProfileService } from "../../services/profile.service";
import { Profile } from "projects/skills/src/models/profile.model";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { PersonalSkillCardComponent } from "../personal-skill-card/personal-skill-card.component";
import { animate, style, transition, trigger } from "@angular/animations";
import { SkillService } from "../../../skills/services/skill.service";

@Component({
  selector: "app-skills-block",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    PersonalRatingCardComponent,
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
  isHintVisible = false;

  profileService = inject(ProfileService);
  skillService = inject(SkillService);
  router = inject(Router);

  skillsList: Profile["skills"] = [];
  displayedSkills: Profile["skills"] = [];
  nonConfirmerModalOpen = signal(false);

  limit = 2;
  offset = 0;
  currentPage = 1;
  totalPages = computed(() => Math.ceil(this.skillsList.length / this.limit));

  tooltipText = "В данном блоке отображаются ваши навыки, которые вы выбрали в текущем месяце.";

  showTooltip() {
    this.isHintVisible = true;
  }

  hideTooltip() {
    this.isHintVisible = false;
  }

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

  prevPage(): void {
    this.offset -= this.limit;
    this.currentPage -= 1;

    if (this.offset < 0) {
      this.offset = 0;
      this.currentPage = 1;
    }

    this.updateDisplayedSkills();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage += 1;
      this.offset += this.limit;
      this.updateDisplayedSkills();
    }
  }

  updateDisplayedSkills() {
    this.displayedSkills = this.skillsList.slice(this.offset, this.offset + this.limit);
  }

  onSkillClick(skillId: number) {
    this.skillService.setSkillId(skillId);
    this.router.navigate(["skills", skillId]).catch(err => {
      if (err.status === 403) {
        this.nonConfirmerModalOpen.set(true);
      }
    });
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((r: Profile) => {
      this.skillsList = r["skills"];
      this.updateDisplayedSkills();
    });
  }
}
