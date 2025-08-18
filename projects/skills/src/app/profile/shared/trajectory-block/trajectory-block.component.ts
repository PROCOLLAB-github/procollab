/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalComponent } from "@ui/components/modal/modal.component";

/**
 * Компонент блока траектории обучения
 *
 * Отображает интерактивный блок для перехода к траектории обучения.
 * Обрабатывает ошибки навигации и показывает модальные окна с уведомлениями.
 *
 * @component TrajectoryBlockComponent
 * @selector app-trajectory-block
 *
 * @property isErrorTrajectoryModalOpen - Флаг отображения модального окна ошибки
 */
@Component({
  selector: "app-trajectory-block",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, ModalComponent],
  templateUrl: "./trajectory-block.component.html",
  styleUrl: "./trajectory-block.component.scss",
})
export class TrajectoryBlockComponent {
  private readonly router = inject(Router);

  isErrorTrajectoryModalOpen = false;

  /**
   * Переключает состояние модального окна ошибки траектории
   */
  onOpenErorTrajectoryModalChange = (): void => {
    this.isErrorTrajectoryModalOpen = !this.isErrorTrajectoryModalOpen;
  };

  /**
   * Выполняет навигацию к траектории обучения
   * При ошибке 404 показывает модальное окно с уведомлением
   */
  navigateToTrajectory = (): void => {
    this.router.navigateByUrl("/trackCar/1").catch(err => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 404) {
          this.isErrorTrajectoryModalOpen = true;
        }
      }
    });
  };
}
