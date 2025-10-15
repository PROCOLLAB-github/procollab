/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { SnackbarService } from "@ui/services/snackbar.service";
import { Snack } from "@ui/models/snack.model";
import { Subscription } from "rxjs";
import { AnimationService } from "@ui/services/animation.service";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";

/**
 * Компонент для отображения всплывающих уведомлений (snackbar).
 * Подписывается на сервис уведомлений и отображает их с анимацией появления/исчезновения.
 * Автоматически скрывает уведомления по истечении заданного времени.
 *
 * Функциональность:
 * - Отображение списка активных уведомлений
 * - Автоматическое скрытие по таймауту
 * - Анимация появления и исчезновения
 * - Возможность ручного закрытия уведомлений
 *
 * Не принимает входящих параметров - работает через сервис SnackbarService
 */
@Component({
  selector: "app-snackbar",
  templateUrl: "./snackbar.component.html",
  styleUrl: "./snackbar.component.scss",
  animations: [AnimationService.slideInOut],
  imports: [CommonModule, IconComponent],
  standalone: true,
})
export class SnackbarComponent implements OnInit, OnDestroy {
  constructor(private readonly snackbarService: SnackbarService) {}

  /** Массив активных уведомлений */
  snacks: Snack[] = [];

  /** Подписка на сервис уведомлений */
  snackbar$?: Subscription;

  /** Добавление нового уведомления */
  private addNotification(snack: Snack): void {
    this.snacks.push(snack);

    if (snack.timeout !== 0) {
      setTimeout(() => this.onClose(snack), snack.timeout);
    }
  }

  /** Подписка на уведомления при инициализации */
  ngOnInit(): void {
    this.snackbar$ = this.snackbarService.snacks.subscribe(snack => this.addNotification(snack));
  }

  /** Отписка от уведомлений при уничтожении */
  ngOnDestroy(): void {
    this.snackbar$?.unsubscribe();
  }

  /** Закрытие конкретного уведомления */
  onClose(snack: Snack): void {
    this.snacks = this.snacks.filter(({ id }) => id !== snack.id);
  }
}
