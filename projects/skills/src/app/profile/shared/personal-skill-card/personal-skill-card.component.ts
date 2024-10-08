/** @format */

import { Component, computed, inject, Input, Output, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CheckboxComponent } from "../../../../../../social_platform/src/app/ui/components/checkbox/checkbox.component";
import { Skill } from "projects/skills/src/models/skill.model";
import { PluralizePipe } from "@corelib";
import { SkillService } from "../../../skills/services/skill.service";
import { ActivatedRoute } from "@angular/router";
import { Skill as ProfileSkill } from "projects/skills/src/models/profile.model";

@Component({
  selector: "app-personal-skill-card",
  standalone: true,
  imports: [CommonModule, CheckboxComponent, CheckboxComponent, PluralizePipe],
  templateUrl: "./personal-skill-card.component.html",
  styleUrl: "./personal-skill-card.component.scss",
})
export class PersonalSkillCardComponent {
  @Input() personalSkillCard!: Skill;
  @Input() profileIdSkills!: WritableSignal<ProfileSkill["skillId"][]>;

  route = inject(ActivatedRoute);
  skillService = inject(SkillService);

  skillsIdList = signal<Skill["id"][]>([]);
  isChecked = signal<boolean>(false);
  selectedCount = computed(() => this.profileIdSkills().length);

  ngOnInit(): void {
    this.skillService.getAll().subscribe(r => {
      this.skillsIdList.set(r.results.map(skill => skill.id));
      this.isChecked.set(this.profileIdSkills().includes(this.personalSkillCard.id));
    });
  }

  toggleCheck(): void {
    if (!this.isChecked()) {
      if (this.selectedCount() < 2) {
        this.profileIdSkills.update(ids => [...ids, this.personalSkillCard.id]);
        this.isChecked.set(true);
      }
    } else {
      this.profileIdSkills.update(ids => ids.filter(id => id !== this.personalSkillCard.id));
      this.isChecked.set(false);
    }
  }
}
