/** @format */

import { TestBed } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";
import { WebsocketService } from "@corelib";
import { Snack } from "@domain/shared/snack.model";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ConnectionStatusToastService } from "./connection-status-toast.service";

describe("ConnectionStatusToastService", () => {
  let status: BehaviorSubject<"idle" | "connected" | "unavailable">;
  let snackbar: SnackbarService;
  let snacks: Snack[];
  let dismissed: string[];

  beforeEach(() => {
    status = new BehaviorSubject<"idle" | "connected" | "unavailable">("idle");
    TestBed.configureTestingModule({
      providers: [
        { provide: WebsocketService, useValue: { connectionStatus$: status.asObservable() } },
      ],
    });
    snackbar = TestBed.inject(SnackbarService);
    snacks = [];
    dismissed = [];
    snackbar.snacks.subscribe(snack => snacks.push(snack));
    snackbar.dismissed$.subscribe(id => dismissed.push(id));
    TestBed.inject(ConnectionStatusToastService);
  });

  it("показывает одно закрываемое сообщение за весь период недоступности", () => {
    status.next("connected");
    expect(snacks).toEqual([]);
    status.next("unavailable");
    status.next("unavailable");
    status.next("unavailable");
    expect(snacks).toHaveLength(1);
    expect(snacks[0]).toMatchObject({ type: "error", timeout: 0, dismissible: true });
    expect(snacks[0].text).toMatch(/Чат временно недоступен/);
  });

  it("убирает сообщение после восстановления и сообщает о следующем отдельном обрыве", () => {
    status.next("unavailable");
    status.next("connected");
    expect(dismissed).toEqual([snacks[0].id]);
    status.next("unavailable");
    expect(snacks).toHaveLength(2);
    expect(snacks[1].id).not.toBe(snacks[0].id);
  });

  it("убирает сообщение при завершении сессии чата", () => {
    status.next("unavailable");
    status.next("idle");
    expect(dismissed).toEqual([snacks[0].id]);
  });
});
