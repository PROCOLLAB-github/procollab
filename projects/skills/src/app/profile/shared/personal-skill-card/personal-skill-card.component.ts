/** @format */

import { Component, computed, inject, Input, Output, signal, WritableSignal } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { CheckboxComponent } from "../../../../../../social_platform/src/app/ui/components/checkbox/checkbox.component";
import { Skill } from "projects/skills/src/models/skill.model";
import { PluralizePipe } from "@corelib";
import { SkillService } from "../../../skills/services/skill.service";
import { ActivatedRoute } from "@angular/router";
import { Skill as ProfileSkill } from "projects/skills/src/models/profile.model";

@Component({
  selector: "app-personal-skill-card",
  standalone: true,
  imports: [CommonModule, CheckboxComponent, CheckboxComponent, PluralizePipe, NgOptimizedImage],
  templateUrl: "./personal-skill-card.component.html",
  styleUrl: "./personal-skill-card.component.scss",
})
export class PersonalSkillCardComponent {
  @Input() personalSkillCard!: Skill;
  @Input() profileIdSkills!: WritableSignal<ProfileSkill["skillId"][]>;
  @Input() isRetryPicked!: WritableSignal<boolean>;

  route = inject(ActivatedRoute);
  skillService = inject(SkillService);

  skillsIdList = signal<Skill["id"][]>([]);
  isChecked = computed(() => this.profileIdSkills().includes(this.personalSkillCard.id));
  selectedCount = computed(() => this.profileIdSkills().length);

  ngOnInit(): void {
    this.skillService.getAllMarked().subscribe(r => {
      this.skillsIdList.set(r.results.map(skill => skill.id));
    });
  }

  toggleCheck(): void {
    if (!this.isChecked()) {
      if (this.selectedCount() < 5) {
        this.profileIdSkills.update(ids => [...ids, this.personalSkillCard.id]);
        if (this.personalSkillCard.isDone === true) {
          this.isRetryPicked.set(true);
        }
      }
    } else {
      this.profileIdSkills.update(ids => ids.filter(id => id !== this.personalSkillCard.id));
    }
  }
}
