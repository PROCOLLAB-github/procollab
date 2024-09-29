import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from "../../../../../../social_platform/src/app/ui/components/checkbox/checkbox.component";
import { Skill } from 'projects/skills/src/models/skill.model';
import { PluralizePipe } from '@corelib';
import { SkillService } from '../../../skills/services/skill.service';
import { ActivatedRoute } from '@angular/router';
import { Skill as ProfileSkill } from 'projects/skills/src/models/profile.model';

@Component({
  selector: 'app-personal-skill-card',
  standalone: true,
  imports: [CommonModule, CheckboxComponent, CheckboxComponent, PluralizePipe],
  templateUrl: './personal-skill-card.component.html',
  styleUrl: './personal-skill-card.component.scss'
})
export class PersonalSkillCardComponent {
  @Input() personalSkillCard!: Skill;

  route = inject(ActivatedRoute);
  skillService = inject(SkillService);

  skillsIdList = signal<Skill['id'][]>([]);
  profileIdSkills = signal<ProfileSkill['skillId'][]>([]);
  isChecked = signal<boolean>(false);

  skillsProfileList = signal<Skill[]>([]);

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.profileIdSkills.set(r['data'].skills.map((skill: ProfileSkill) => skill.skillId));
      this.skillsProfileList.set(r['data'].skills);
    })

    this.skillService.getAll().subscribe(r => {
      this.skillsIdList.set(r.results.map(skill => skill.id));
      this.isChecked.set(this.profileIdSkills().includes(this.personalSkillCard.id));
    })

  }

  toggleCheck(): void {
    if (!this.isChecked()) {
      this.profileIdSkills.update(ids => [...ids, this.personalSkillCard.id]);
      this.skillsProfileList.update(skills => [...skills, this.personalSkillCard]);
    } else {
      this.profileIdSkills.update(ids => ids.filter(id => id !== this.personalSkillCard.id));
      this.skillsProfileList.update(skills => skills.filter(skill => skill.id !== this.personalSkillCard.id));
    }

    this.isChecked.set(!this.isChecked());
  }
}
