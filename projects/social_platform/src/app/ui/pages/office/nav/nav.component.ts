/** @format */

import { InviteManageCardComponent, ProfileInfoComponent } from "@uilib";
import { NotificationService } from "@ui/services/notification/notification.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { IconComponent } from "@ui/primitives";
import { NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import { InviteInfoService } from "@api/invite/facades/invite-info.service";

/**
 * Компонент навигационного меню
 *
 * Функциональность:
 * - Отображает основное навигационное меню приложения
 * - Управляет мобильным меню (открытие/закрытие)
 * - Показывает уведомления и приглашения
 * - Обрабатывает принятие и отклонение приглашений
 * - Отображает информацию о профиле пользователя
 * - Автоматически закрывает мобильное меню при навигации
 * - Интеграция с внешним сервисом навыков
 * - Динамическое обновление заголовка страницы
 *
 * Входные параметры:
 * @Input invites - массив приглашений пользователя
 *
 * Внутренние свойства:
 * - mobileMenuOpen - флаг состояния мобильного меню
 * - notificationsOpen - флаг состояния панели уведомлений
 * - title - текущий заголовок страницы
 * - subscriptions$ - массив подписок для управления памятью
 * - hasInvites - вычисляемое свойство наличия непрочитанных приглашений
 *
 * Сервисы:
 * - navService - управление навигацией и заголовками
 * - notificationService - управление уведомлениями
 * - inviteService - работа с приглашениями
 * - authService - аутентификация и профиль пользователя
 */
@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrl: "./nav.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    RouterLink,
    RouterLinkActive,
    InviteManageCardComponent,
    ProfileInfoComponent,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navService = inject(NavService);

  readonly invites = this.inviteInfoService.invites;

  constructor(
    private readonly router: Router,
    public readonly notificationService: NotificationService,
    public readonly authRepository: AuthInfoService,
    private readonly inviteInfoService: InviteInfoService,
    private readonly cdref: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Подписка на события роутера для закрытия мобильного меню
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.mobileMenuOpen = false;
      }
    });

    // Подписка на изменения заголовка страницы
    this.navService.navTitle.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(title => {
      this.title = title;
      this.cdref.detectChanges();
    });
  }

  ngOnDestroy(): void {}

  mobileMenuOpen = false;
  notificationsOpen = false;
  title = "";
  protected readonly AppRoutes = AppRoutes;

  /**
   * Проверка наличия непринятых приглашений
   * Возвращает true если есть приглашения со статусом null (не принято/не отклонено)
   */
  get hasInvites(): boolean {
    return this.invites().some(i => i.isAccepted === null);
  }

  /**
   * Обработчик отклонения приглашения
   * Отправляет запрос на отклонение и удаляет приглашение из списка
   */
  onRejectInvite(inviteId: number): void {
    this.inviteInfoService
      .rejectInviteAction(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.notificationsOpen = false;
        this.mobileMenuOpen = false;
      });
  }

  /**
   * Обработчик принятия приглашения
   * Отправляет запрос на принятие, удаляет приглашение из списка
   * и перенаправляет пользователя на страницу проекта
   */
  onAcceptInvite(inviteId: number): void {
    const invite = this.invites().find(i => i.id === inviteId);
    if (!invite) return;

    this.inviteInfoService
      .acceptInviteAction(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.notificationsOpen = false;
        this.mobileMenuOpen = false;

        this.router
          .navigateByUrl(AppRoutes.projects.detail(invite.project.id))
          .then(() => this.logger.debug("Route changed from HeaderComponent"));
      });
  }
}
