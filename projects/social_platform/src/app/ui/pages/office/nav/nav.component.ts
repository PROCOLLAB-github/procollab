/** @format */

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
import { NavService } from "@ui/services/nav/nav.service";
import { NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { noop } from "rxjs";
import { Invite } from "@domain/invite/invite.model";
import { AsyncPipe } from "@angular/common";
import { IconComponent } from "@ui/primitives";
import { InviteManageCardComponent, ProfileInfoComponent } from "@uilib";
import { NotificationService } from "@ui/services/notification/notification.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AcceptInviteUseCase } from "@api/invite/use-cases/accept-invite.use-case";
import { RejectInviteUseCase } from "@api/invite/use-cases/reject-invite.use-case";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { AppRoutes } from "@api/paths/app-routes";

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
  standalone: true,
  imports: [
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
  private readonly acceptInviteUseCase = inject(AcceptInviteUseCase);
  private readonly rejectInviteUseCase = inject(RejectInviteUseCase);

  constructor(
    public readonly navService: NavService,
    private readonly router: Router,
    public readonly notificationService: NotificationService,
    public readonly authRepository: AuthInfoService,
    private readonly cdref: ChangeDetectorRef
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

  @Input() invites: Invite[] = [];

  mobileMenuOpen = false;
  notificationsOpen = false;
  title = "";
  protected readonly AppRoutes = AppRoutes;

  /**
   * Проверка наличия непринятых приглашений
   * Возвращает true если есть приглашения со статусом null (не принято/не отклонено)
   */
  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  /**
   * Обработчик отклонения приглашения
   * Отправляет запрос на отклонение и удаляет приглашение из списка
   */
  onRejectInvite(inviteId: number): void {
    this.rejectInviteUseCase
      .execute(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        const index = this.invites.findIndex(invite => invite.id === inviteId);
        this.invites.splice(index, 1);

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
    this.acceptInviteUseCase
      .execute(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        const index = this.invites.findIndex(invite => invite.id === inviteId);
        const invite = JSON.parse(JSON.stringify(this.invites[index]));
        this.invites.splice(index, 1);

        this.notificationsOpen = false;
        this.mobileMenuOpen = false;

        this.router
          .navigateByUrl(AppRoutes.projects.detail(invite.project.id))
          .then(() => this.logger.debug("Route changed from HeaderComponent"));
      });
  }

  /**
   * Переход на внешний сервис навыков
   * Открывает новую вкладку с сервисом skills.procollab.ru
   */
  openSkills() {
    location.href = "https://skills.procollab.ru";
  }

  protected readonly noop = noop;
}
