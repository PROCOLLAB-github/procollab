/** @format */

import { inject, Injectable } from "@angular/core";
import { WebsocketService } from "@corelib";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Одно закрываемое уведомление на период недоступности чата; скрывается после восстановления. */
@Injectable({ providedIn: "root" })
export class ConnectionStatusToastService {
  private readonly websocketService = inject(WebsocketService);
  private readonly snackbarService = inject(SnackbarService);
  private notificationId?: string;

  constructor() {
    this.websocketService.connectionStatus$.pipe(takeUntilDestroyed()).subscribe(status => {
      if (status === "unavailable") {
        if (!this.notificationId) {
          this.notificationId = this.snackbarService.error(
            "Чат временно недоступен. Сообщения и статусы могут обновляться с задержкой. Подключаемся автоматически.",
            { timeout: 0, dismissible: true },
          );
        }
      } else if (this.notificationId) {
        this.snackbarService.dismiss(this.notificationId);
        this.notificationId = undefined;
      }
    });
  }
}
