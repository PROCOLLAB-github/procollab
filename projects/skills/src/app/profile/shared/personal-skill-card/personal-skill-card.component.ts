/** @format */

import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
  WritableSignal,
} from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { CheckboxComponent } from "../../../../../../social_platform/src/app/ui/components/checkbox/checkbox.component";
import { Skill } from "projects/skills/src/models/skill.model";
import { PluralizePipe } from "@corelib";
import { SkillService } from "../../../skills/services/skill.service";
import { ActivatedRoute } from "@angular/router";
import { Skill as ProfileSkill } from "projects/skills/src/models/profile.model";

/**
 * Компонент карточки навыка для выбора в личном кабинете
 *
 * Отображает информацию о навыке с возможностью выбора/отмены выбора.
 * Ограничивает выбор до 5 навыков максимум.
 * Показывает состояние навыка (выполнен/не выполнен).
 *
 * @component PersonalSkillCardComponent
 * @selector app-personal-skill-card
 *
 * @input personalSkillCard - Данные навыка для отображения
 * @input profileIdSkills - Сигнал с массивом ID выбранных навыков
 * @input isRetryPicked - Сигнал флага повторного выбора навыка
 *
 * @output selectedCountChange - Событие изменения количества выбранных навыков
 */
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

  @Output() selectedCountChange: EventEmitter<number> = new EventEmitter<number>();

  route = inject(ActivatedRoute);
  skillService = inject(SkillService);

  /** Вычисляемое свойство - выбран ли текущий навык */
  isChecked = computed(() => this.profileIdSkills().includes(this.personalSkillCard.id));
  /** Вычисляемое свойство - количество выбранных навыков */
  selectedCount = computed(() => this.profileIdSkills().length);

  ngOnInit(): void {}

  /**
   * Переключает состояние выбора навыка
   * Проверяет ограничения на количество выбранных навыков (максимум 5)
   * Устанавливает флаг повторного выбора если навык уже был выполнен
   */
  toggleCheck(): void {
    const currentId = this.personalSkillCard.id;

    if (!this.isChecked()) {
      if (this.selectedCount() < 5) {
        this.profileIdSkills.update(ids => [...ids, currentId]);

        this.selectedCountChange.emit(this.selectedCount());

        if (this.personalSkillCard.isDone === true) {
          this.isRetryPicked.set(true);
        }
      }
    } else {
      this.profileIdSkills.update(ids => ids.filter(id => id !== currentId));

      this.selectedCountChange.emit(this.selectedCount());
    }
  }
}
