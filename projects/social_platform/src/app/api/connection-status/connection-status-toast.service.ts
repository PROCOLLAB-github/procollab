/** @format */

import { inject, Injectable } from "@angular/core";
import { WebsocketService } from "@corelib";
import { SnackbarService } from "@domain/shared/snackbar.service";

/** Слушает потерю WebSocket-соединения и показывает пользователю toast. */
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
