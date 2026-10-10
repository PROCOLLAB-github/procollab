/** @format */

import { TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { BehaviorSubject, of } from "rxjs";
import { TokenService, WebsocketService } from "@corelib";
import { LoadingService } from "@api/shared/loading.service";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { Snack } from "@domain/shared/snack.model";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("AppComponent", () => {
  let connectionStatus: BehaviorSubject<"idle" | "connected" | "unavailable">;

  beforeEach(async () => {
    connectionStatus = new BehaviorSubject<"idle" | "connected" | "unavailable">("connected");
    const authPortSpy = {
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const tokenSpy = { getTokens: vi.fn().mockReturnValue(null) };
    const loadingSpy = {
      show: vi.fn(),
      hide: vi.fn(),
      isLoading$: of(false),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: TokenService, useValue: tokenSpy },
        { provide: LoadingService, useValue: loadingSpy },
        {
          provide: WebsocketService,
          useValue: { connectionStatus$: connectionStatus.asObservable() },
        },
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("не уведомляет о фоне скрытых чатов и сохраняет остальные сообщения ошибок", () => {
    const snackbar = TestBed.inject(SnackbarService);
    const emitted: Snack[] = [];
    snackbar.snacks.subscribe(snack => emitted.push(snack));
    TestBed.createComponent(AppComponent);

    connectionStatus.next("unavailable");
    connectionStatus.next("connected");
    connectionStatus.next("unavailable");
    expect(emitted).toEqual([]);

    snackbar.error("Не удалось загрузить программу", { timeout: 0 });
    expect(emitted.map(snack => snack.text)).toEqual(["Не удалось загрузить программу"]);
  });
});
