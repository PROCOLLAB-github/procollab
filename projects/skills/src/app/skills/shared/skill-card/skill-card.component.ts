/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { Skill } from "../../../../models/skill.model";
import { PluralizePipe } from "@corelib";

/**
 * Компонент карточки навыка
 *
 * Отображает краткую информацию о навыке в виде карточки
 *
 * @Input skill - Объект с данными навыка (обязательный)
 * @Input type - Тип отображения карточки: 'personal' | 'base' (по умолчанию 'base')
 *
 * Функциональность:
 * - Отображение основной информации о навыке
 * - Поддержка двух визуальных стилей
 * - Индикация статуса навыка (подписка, просрочка, выполнение)
 * - Плюрализация для количества уровней
 */
@Component({
  selector: "app-skill-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent, PluralizePipe],
  templateUrl: "./skill-card.component.html",
  styleUrl: "./skill-card.component.scss",
})
export class SkillCardComponent {
  @Input({ required: true }) skill!: Skill;
  @Input() type: "personal" | "base" = "base";
}
