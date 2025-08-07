/** @format */

import { Component, inject, type OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PersonalRatingCardComponent } from "../shared/personal-rating-card/personal-rating-card.component";
import { Profile } from "projects/skills/src/models/profile.model";
import { ProfileService } from "../services/profile.service";
import { SkillService } from "../../skills/services/skill.service";
import { RouterModule } from "@angular/router";

/**
 * Компонент страницы рейтинга навыков пользователя
 *
 * Отображает полный список навыков пользователя с их рейтингами и прогрессом.
 * Загружает данные профиля при инициализации и показывает карточки навыков.
 *
 * @component ProfileSkillsRatingComponent
 * @selector app-skills-rating
 *
 * @property skillsList - Список навыков пользователя с рейтингами
 */
@Component({
  selector: "app-skills-rating",
  standalone: true,
  imports: [CommonModule, PersonalRatingCardComponent, RouterModule],
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
