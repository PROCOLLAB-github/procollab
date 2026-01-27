/** @format */

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@ui/services/nav/nav.service";
import { NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { noop, Subscription } from "rxjs";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { InviteService } from "projects/social_platform/src/app/api/invite/invite.service";
import { AsyncPipe } from "@angular/common";
import { IconComponent } from "@ui/components";
import { InviteManageCardComponent, ProfileInfoComponent } from "@uilib";
import { AuthService } from "../../../api/auth";
import { NotificationService } from "@ui/services/notification/notification.service";

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
})
export class NavComponent implements OnInit, OnDestroy {
  constructor(
    public readonly navService: NavService,
    private readonly router: Router,
    public readonly notificationService: NotificationService,
    private readonly inviteService: InviteService,
    public readonly authService: AuthService,
    private readonly cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Подписка на события роутера для закрытия мобильного меню
    const routerEvents$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.mobileMenuOpen = false;
      }
    });
    routerEvents$ && this.subscriptions$.push(routerEvents$);

    // Подписка на изменения заголовка страницы
    const title$ = this.navService.navTitle.subscribe(title => {
      this.title = title;
      this.cdref.detectChanges();
    });

    title$ && this.subscriptions$.push(title$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  @Input() invites: Invite[] = [];

  subscriptions$: Subscription[] = [];
  mobileMenuOpen = false;
  notificationsOpen = false;
  title = "";

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
    this.inviteService.rejectInvite(inviteId).subscribe(() => {
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
    this.inviteService.acceptInvite(inviteId).subscribe(() => {
      const index = this.invites.findIndex(invite => invite.id === inviteId);
      const invite = JSON.parse(JSON.stringify(this.invites[index]));
      this.invites.splice(index, 1);

      this.notificationsOpen = false;
      this.mobileMenuOpen = false;

      this.router
        .navigateByUrl(`/office/projects/${invite.project.id}`)
        .then(() => console.debug("Route changed from HeaderComponent"));
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
