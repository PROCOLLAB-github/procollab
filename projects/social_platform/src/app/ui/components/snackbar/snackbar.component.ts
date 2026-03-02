/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { Snack } from "@ui/models/snack.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AnimationService } from "@ui/services/animation/animation.service";
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly snackbarService: SnackbarService) {}

  /** Массив активных уведомлений */
  snacks: Snack[] = [];

  /** Добавление нового уведомления */
  private addNotification(snack: Snack): void {
    this.snacks.push(snack);

    if (snack.timeout !== 0) {
      setTimeout(() => this.onClose(snack), snack.timeout);
    }
  }

  /** Подписка на уведомления при инициализации */
  ngOnInit(): void {
    this.snackbarService.snacks
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(snack => this.addNotification(snack));
  }

  /** Отписка от уведомлений при уничтожении */
  ngOnDestroy(): void {}

  /** Закрытие конкретного уведомления */
  onClose(snack: Snack): void {
    this.snacks = this.snacks.filter(({ id }) => id !== snack.id);
  }
}
