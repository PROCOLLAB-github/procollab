/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { filter, map, Observable, take } from "rxjs";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { AuthService } from "@auth/services";
import { ChatService } from "@services/chat.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { YearsFromBirthdayPipe } from "projects/core";
import { BarComponent, ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { calculateProfileProgress } from "@utils/calculateProgress";
import { ProfileService as SkillsProfileService } from "projects/skills/src/app/profile/services/profile.service";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { ProfileDataService } from "./services/profile-date.service";

/**
 * Компонент детального просмотра профиля пользователя
 *
 * Основной компонент для отображения полной информации о пользователе, включая:
 * - Аватар с индикатором онлайн-статуса
 * - Основную информацию (имя, возраст, специальность, город)
 * - Кнопки действий (написать сообщение, редактировать профиль, скачать CV)
 * - Навигационную панель для переключения между разделами
 * - Модальные окна для различных уведомлений
 *
 * Функциональность:
 * - Отображение профиля текущего или другого пользователя
 * - Отправка CV на email с ограничениями по времени
 * - Проверка статуса подписки для доступа к функциям
 * - Адаптивный дизайн для мобильных и десктопных устройств
 * - Интеграция с чат-сервисом для отправки сообщений
 *
 * @implements OnInit - для инициализации компонента и загрузки данных
 */
@Component({
  selector: "app-profile-detail",
  templateUrl: "./profile-detail.component.html",
  styleUrl: "./profile-detail.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    RouterOutlet,
    AsyncPipe,
    YearsFromBirthdayPipe,
    BarComponent,
    ModalComponent,
  ],
})
export class ProfileDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly navService = inject(NavService);
  private readonly profileDataService = inject(ProfileDataService);
  public readonly authService = inject(AuthService);
  public readonly chatService = inject(ChatService);
  public readonly skillsProfileService = inject(SkillsProfileService);
  public readonly breakpointObserver = inject(BreakpointObserver);

  /**
   * Инициализация компонента
   * Настраивает заголовок навигации, проверяет статус подписки,
   * определяет необходимость заполнения профиля
   */
  ngOnInit(): void {
    this.navService.setNavTitle("Профиль");

    this.profileDataService
      .getProfile()
      .pipe(
        map(user => ({ ...user, progress: calculateProfileProgress(user!) })),
        filter(user => !!user),
        take(1)
      )
      .subscribe({
        next: user => {
          this.user = user as User;
          this.isProfileFill =
            user.progress! < 100 ? (this.isProfileFill = true) : (this.isProfileFill = false);
        },
      });

    this.skillsProfileService.getSubscriptionData().subscribe(r => {
      this.isSubscriptionActive.set(r.isSubscribed);
    });
  }

  user?: User;

  loggedUserId$: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  isDelayModalOpen = false;
  isSended = false;
  isSubscriptionActive = signal(false);

  isProfileFill = false;

  tooltipText = "Заполни до конца — и открой весь функционал платформы!";
  isHintVisible = false;

  errorMessageModal = signal("");
  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  /**
   * Показать подсказку для незаполненного профиля
   */
  showTooltip() {
    this.isHintVisible = true;
  }

  /**
   * Скрыть подсказку для незаполненного профиля
   */
  hideTooltip() {
    this.isHintVisible = false;
  }

  /**
   * Отправка CV пользователя на email
   * Проверяет ограничения по времени и отправляет CV на почту пользователя
   */
  sendCVEmail() {
    this.authService.sendCV().subscribe({
      next: () => {
        this.isSended = true;
      },
      error: err => {
        if (err.status === 400) {
          this.isDelayModalOpen = true;
          this.errorMessageModal.set(err.error.seconds_after_retry);
        }
      },
    });
  }
}
