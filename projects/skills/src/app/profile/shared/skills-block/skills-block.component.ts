/** @format */

import { Component, computed, inject, type OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { PersonalRatingCardComponent } from "../personal-rating-card/personal-rating-card.component";
import { IconComponent } from "@uilib";
import { Router, RouterLink } from "@angular/router";
import { SkillChooserComponent } from "../skill-chooser/skill-chooser.component";
import { ProfileService } from "../../services/profile.service";
import type { Profile } from "projects/skills/src/models/profile.model";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { SkillService } from "../../../skills/services/skill.service";

/**
 * Компонент блока навыков пользователя
 *
 * Отображает список выбранных навыков пользователя с пагинацией.
 * Поддерживает навигацию к детальной странице навыка и выбор новых навыков.
 * Обрабатывает ошибки доступа для пользователей без подписки.
 *
 * @component SkillsBlockComponent
 * @selector app-skills-block
 *
 * @property openSkillChoose - Флаг модального окна выбора навыков
 * @property openInstruction - Флаг модального окна инструкций
 * @property skillsList - Полный список навыков пользователя
 * @property displayedSkills - Навыки для отображения на текущей странице
 * @property limit - Количество навыков на странице (2)
 * @property currentPage - Текущая страница
 * @property totalPages - Общее количество страниц (вычисляемое)
 */
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

  /**
   * Показывает подсказку
   */
  showTooltip() {
    this.isHintVisible = true;
  }

  /**
   * Скрывает подсказку
   */
  hideTooltip() {
    this.isHintVisible = false;
  }

  /**
   * Обрабатывает изменение состояния модального окна выбора навыков
   */
  onOpenSkillsChange(open: boolean) {
    this.openSkillChoose = open;
  }

  /**
   * Обрабатывает изменение состояния модального окна инструкций
   */
  onOpenInstructionChange(open: boolean) {
    this.openSkillChoose = open;
  }

  /**
   * Переходит от инструкций к выбору навыков
   */
  nextStepModal() {
    this.openInstruction = false;
    this.openSkillChoose = true;
  }

  /**
   * Переходит к предыдущей странице навыков
   */
  prevPage(): void {
    this.offset -= this.limit;
    this.currentPage -= 1;

    if (this.offset < 0) {
      this.offset = 0;
      this.currentPage = 1;
    }

    this.updateDisplayedSkills();
  }

  /**
   * Переходит к следующей странице навыков
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage += 1;
      this.offset += this.limit;
      this.updateDisplayedSkills();
    }
  }

  /**
   * Обновляет список отображаемых навыков на основе текущей страницы
   */
  updateDisplayedSkills() {
    this.displayedSkills = this.skillsList.slice(this.offset, this.offset + this.limit);
  }

  /**
   * Обрабатывает клик по навыку для перехода к детальной странице
   * @param skillId - ID навыка
   */
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
