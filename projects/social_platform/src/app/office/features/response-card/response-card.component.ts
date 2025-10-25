/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { VacancyResponse } from "@models/vacancy-response.model";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { ButtonComponent } from "@ui/components";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { RouterLink } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { AuthService } from "@auth/services";
import { ProjectVacancyCardComponent } from "@office/projects/detail/shared/project-vacancy-card/project-vacancy-card.component";
import { IconComponent } from "@uilib";

/**
 * Компонент карточки отклика на вакансию
 *
 * Функциональность:
 * - Отображает информацию об отклике на вакансию (кандидат, роль, файлы)
 * - Показывает аватар и основную информацию о кандидате
 * - Отображает прикрепленные файлы (резюме, портфолио)
 * - Предоставляет кнопки для принятия или отклонения отклика
 * - Ссылка на профиль кандидата
 * - Получает ID текущего пользователя для проверки прав доступа
 *
 * Входные параметры:
 * @Input response - объект отклика на вакансию (обязательный)
 *
 * Выходные события:
 * @Output reject - событие отклонения отклика, передает ID отклика
 * @Output accept - событие принятия отклика, передает ID отклика
 *
 * Внутренние свойства:
 * - profileId - ID текущего пользователя для проверки прав
 */
@Component({
  selector: "app-response-card",
  templateUrl: "./response-card.component.html",
  styleUrl: "./response-card.component.scss",
  standalone: true,
  imports: [
    RouterLink,
    AvatarComponent,
    TagComponent,
    IconComponent,
    ButtonComponent,
    UserRolePipe,
    AsyncPipe,
    FileItemComponent,
    ProjectVacancyCardComponent,
  ],
})
export class ResponseCardComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  @Input({ required: true }) response!: VacancyResponse;
  @Output() reject = new EventEmitter<number>();
  @Output() accept = new EventEmitter<number>();

  profileId!: number;

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: profile => {
        this.profileId = profile.id;
      },
    });
  }

  /**
   * Обработчик принятия отклика
   * Эмитит событие с ID отклика
   */
  onAccept(responseId: number) {
    this.accept.emit(responseId);
  }

  /**
   * Обработчик отклонения отклика
   * Эмитит событие с ID отклика
   */
  onReject(responseId: number) {
    this.reject.emit(responseId);
  }
}
