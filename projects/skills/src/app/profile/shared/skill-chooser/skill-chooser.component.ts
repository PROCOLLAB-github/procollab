/** @format */

import { Component, inject, Input, signal, EventEmitter, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";
import { PersonalRatingCardComponent } from "../personal-rating-card/personal-rating-card.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { SkillService } from "../../../skills/services/skill.service";
import { Skill } from "projects/skills/src/models/skill.model";
import { PersonalSkillCardComponent } from "../personal-skill-card/personal-skill-card.component";
import { ProfileService } from "../../services/profile.service";
import { Skill as ProfileSkill } from "projects/skills/src/models/profile.model";

@Component({
  selector: "app-skill-chooser",
  standalone: true,
  imports: [
    CommonModule,
    PersonalRatingCardComponent,
    ButtonComponent,
    ModalComponent,
    RouterLink,
    IconComponent,
    PersonalSkillCardComponent,
  ],
  templateUrl: "./skill-chooser.component.html",
  styleUrl: "./skill-chooser.component.scss",
})
export class SkillChooserComponent implements OnInit {
  @Input() open = false;
  @Output() openChange: EventEmitter<boolean> = new EventEmitter();

  route = inject(ActivatedRoute);
  skillService = inject(SkillService);
  profileService = inject(ProfileService);

  limit: number = 3;
  offset: number = 0;

  skillsList = signal<Skill[]>([]);
  profileIdSkills = signal<ProfileSkill["skillId"][]>([]);

  ngOnInit(): void {
    this.skillService.getAll(this.limit, this.offset).subscribe(r => {
      this.skillsList.set(r.results);
    });

    this.route.data.subscribe(r => {
      this.profileIdSkills.set(r["data"].skills.map((skill: ProfileSkill) => skill.skillId));
    });
  }

  onOpenChange(event: boolean) {
    this.openChange.emit(event);
  }

  onCloseModal() {
    this.openChange.emit(false);
    this.profileService.addSkill(this.profileIdSkills()).subscribe();
  }

  prevPage(): void {
    this.offset -= this.limit;
    if (this.offset < 0) {
      this.offset = 0;
    }
    this.skillService.getAll(this.limit, this.offset).subscribe(r => {
      this.skillsList.set(r.results);
    });
  }

  nextPage(): void {
    this.offset += this.limit;
    this.skillService.getAll(this.limit, this.offset).subscribe(r => {
      this.skillsList.set(r.results);
    });
  }
}
