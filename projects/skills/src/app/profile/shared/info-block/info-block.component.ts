/** @format */

import { Component, HostListener, inject, Input, OnDestroy, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { AvatarComponent, IconComponent } from "@uilib";
import { Router } from "@angular/router";
import { Profile, UserData } from "../../../../models/profile.model";
import { PluralizePipe } from "@corelib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProfileService } from "../../services/profile.service";
import { Subscription } from "rxjs";

/**
 * Компонент информационного блока пользователя
 *
 * Отображает основную информацию о пользователе:
 * - Аватар, имя, возраст, специализацию
 * - Статус наставника (если применимо)
 * - Количество баллов
 * - Модальное окно уведомления о подписке
 *
 * @component InfoBlockComponent
 * @selector app-info-block
 *
 * @input userData - Данные пользователя для отображения
 *
 * @property avatarSize - Размер аватара (адаптивный)
 * @property openSuscriptionBought - Флаг модального окна подписки
 * @property isMentor - Флаг статуса наставника
 */
@Component({
  selector: "app-info-block",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    PluralizePipe,
    AvatarComponent,
    ModalComponent,
  ],
  templateUrl: "./info-block.component.html",
  styleUrl: "./info-block.component.scss",
})
export class InfoBlockComponent implements OnInit, OnDestroy {
  @Input({ required: true }) userData!: Profile["userData"];

  router = inject(Router);
  profileService = inject(ProfileService);
  subscriptions: Subscription[] = [];
  achievementsList = Array;

  avatarSize = signal(window.innerWidth > 1200 ? 165 : 90);
  openSuscriptionBought = false;
  isMentor?: boolean;

  ngOnInit(): void {
    const isMentorSub = this.profileService.getUserData().subscribe((res: UserData) => {
      this.isMentor = res.isMentor;
    });

    const hasShownModal = localStorage.getItem("hasShownSubscriptionModal");

    if (!hasShownModal) {
      const profileSub = this.profileService.getSubscriptionData().subscribe({
        next: r => {
          this.openSuscriptionBought = r.lastSubscriptionType === null;
          if (this.openSuscriptionBought) {
            localStorage.setItem("hasShownSubscriptionModal", "true");
          }
        },
      });
      this.subscriptions.push(profileSub);
    }

    this.subscriptions.push(isMentorSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Обрабатывает изменение размера окна для адаптивного размера аватара
   */
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.avatarSize.set(event.target.innerWidth > 1200 ? 165 : 90);
  }
}
