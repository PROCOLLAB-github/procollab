/** @format */

import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { map, Observable } from "rxjs";
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
  constructor(
    private readonly route: ActivatedRoute,
    private readonly navService: NavService,
    public readonly authService: AuthService,
    public readonly chatService: ChatService,
    public readonly skillsProfileService: SkillsProfileService,
    public readonly breakpointObserver: BreakpointObserver
  ) {}

  user$: Observable<User> = this.route.data.pipe(
    map(r => r["data"][0]),
    map(user => ({ ...user, progress: calculateProfileProgress(user) }))
  );

  loggedUserId$: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  isDelayModalOpen = false;
  isSended = false;
  isSubscriptionActive = signal(false);

  isProfileFill = false;

  tooltipText = "Заполни до конца — и открой весь функционал платформы!";
  isHintVisible = false;

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

  errorMessageModal = signal("");
  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  /**
   * Инициализация компонента
   * Настраивает заголовок навигации, проверяет статус подписки,
   * определяет необходимость заполнения профиля
   */
  ngOnInit(): void {
    this.navService.setNavTitle("Профиль");

    this.skillsProfileService.getSubscriptionData().subscribe(r => {
      this.isSubscriptionActive.set(r.isSubscribed);
    });

    this.user$.subscribe(r => {
      this.isProfileFill =
        r.progress! < 100 ? (this.isProfileFill = true) : (this.isProfileFill = false);
    });
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
