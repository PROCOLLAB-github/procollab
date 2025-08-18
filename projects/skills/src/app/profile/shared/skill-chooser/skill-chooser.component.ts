/** @format */

import {
  Component,
  inject,
  Input,
  signal,
  EventEmitter,
  Output,
  OnInit,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { SkillService } from "../../../skills/services/skill.service";
import { Skill } from "projects/skills/src/models/skill.model";
import { PersonalSkillCardComponent } from "../personal-skill-card/personal-skill-card.component";
import { ProfileService } from "../../services/profile.service";
import { Skill as ProfileSkill } from "projects/skills/src/models/profile.model";
import { HttpErrorResponse } from "@angular/common/http";

/**
 * Компонент выбора навыков для месячной подписки
 *
 * Позволяет пользователю выбрать 5 навыков из доступного списка.
 * Поддерживает пагинацию, валидацию выбора и обработку ошибок подписки.
 *
 * @component SkillChooserComponent
 * @selector app-skill-chooser
 *
 * @input open - Флаг отображения модального окна выбора
 * @output openChange - Событие изменения состояния модального окна
 *
 * @property limit - Количество навыков на странице (3)
 * @property offset - Смещение для пагинации
 * @property currentPage - Текущая страница
 * @property totalPages - Общее количество страниц (вычисляемое)
 * @property skillsList - Список доступных навыков
 * @property profileIdSkills - Выбранные навыки пользователя
 */
@Component({
  selector: "app-skill-chooser",
  standalone: true,
  imports: [
    CommonModule,
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
  @Input() open!: boolean;
  @Output() openChange: EventEmitter<boolean> = new EventEmitter();

  route = inject(ActivatedRoute);
  skillService = inject(SkillService);
  profileService = inject(ProfileService);

  limit = 3;
  offset = 0;
  currentPage = 1;

  totalPages = computed(() => Math.ceil(this.totalSkills() / this.limit));
  totalSkills = signal<number>(0);

  skillsList = signal<Skill[]>([]);
  profileIdSkills = signal<ProfileSkill["skillId"][]>([]);

  isRetryPicked = signal<boolean>(false);
  nonConfirmerModalOpen = signal<boolean>(false);

  selectedSkillsCount = signal<number>(0);

  constructor() {
    this.skillsList.set([]);
    this.totalSkills.set(0);
  }

  ngOnInit(): void {
    this.loadSkills();

    this.route.data.subscribe(r => {
      this.profileIdSkills.set(r["data"].skills.map((skill: ProfileSkill) => skill.skillId));
    });
  }

  /**
   * Загружает список навыков с сервера с учетом пагинации
   * Обрабатывает ошибку 403 (нет подписки)
   */
  private loadSkills(): void {
    this.skillService.getAllMarked(this.limit, this.offset).subscribe({
      next: r => {
        if (r.results && Array.isArray(r.results)) {
          this.skillsList.set(
            r.results.map(skill => ({
              ...skill,
              isSelected: this.profileIdSkills().includes(skill.id),
            }))
          );
          this.totalSkills.set(r.count);
        }
      },
      error: err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 403) {
            this.nonConfirmerModalOpen.set(true);
          }
        }
      },
    });
  }

  /**
   * Обрабатывает изменение состояния модального окна
   */
  onOpenChange(event: boolean) {
    this.openChange.emit(event);
  }

  /**
   * Закрывает модальное окно и сохраняет выбранные навыки
   */
  onCloseModal() {
    this.openChange.emit(false);
    this.profileService.addSkill(this.profileIdSkills()).subscribe();
  }

  /**
   * Закрывает модальное окно подписки
   */
  onSubscriptionModalClosed() {
    this.nonConfirmerModalOpen.set(false);
    this.open = false;
  }

  /**
   * Переходит к предыдущей странице навыков
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.offset = (this.currentPage - 1) * this.limit;
      this.loadSkills();
    }
  }

  /**
   * Переходит к следующей странице навыков
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage += 1;
      this.offset = (this.currentPage - 1) * this.limit;
      this.loadSkills();
    }
  }

  /**
   * Обрабатывает изменение количества выбранных навыков
   */
  onSelectedCountChange(count: number): void {
    this.selectedSkillsCount.set(count);
  }
}
