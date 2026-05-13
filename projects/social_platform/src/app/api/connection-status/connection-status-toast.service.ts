/** @format */

import { inject, Injectable } from "@angular/core";
import { WebsocketService } from "@corelib";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";

/**
 * Слушает потерю WebSocket-соединения и показывает пользователю toast.
 *
 * Активируется при first inject (например, в AppComponent), дальше
 * живёт всё время жизни приложения и реагирует на `connectionLost$`.
 */
@Injectable({ providedIn: "root" })
export class ConnectionStatusToastService {
  private readonly websocketService = inject(WebsocketService);
  private readonly snackbarService = inject(SnackbarService);

  constructor() {
    this.websocketService.connectionLost$.subscribe(() =>
      this.snackbarService.error("Соединение с сервером потеряно. Проверьте интернет.")
    );
  }
}
