/** @format */

import { TestBed } from "@angular/core/testing";

import { WebsocketService } from "./websocket.service";
import { TokenService } from "../tokens/token.service";
import { environment } from "@environment";

describe("WebsocketService", () => {
  let service: WebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        {
          provide: TokenService,
          useValue: {
            getTokens: vi.fn(),
            clearTokens: vi.fn(),
            memTokens: vi.fn(),
            refreshTokens: vi.fn(),
            getCookieOptions: vi.fn(),
          },
        },
      ],
    });
    service = TestBed.inject(WebsocketService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("восстановление соединения", () => {
    let sockets: any[];

    beforeEach(() => {
      vi.useFakeTimers();
      sockets = [];
      vi.stubGlobal(
        "WebSocket",
        class {
          static OPEN = 1;
          readyState = 0;
          onopen: (() => void) | null = null;
          onerror: (() => void) | null = null;
          onclose: (() => void) | null = null;
          onmessage: (() => void) | null = null;
          send = vi.fn();
          close = vi.fn(() => {
            this.readyState = 3;
          });
          constructor() {
            sockets.push(this);
          }
        },
      );
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it("продолжает retry, сообщает один период недоступности и фиксирует восстановление", () => {
      const states: string[] = [];
      service.connectionStatus$.subscribe(state => states.push(state));
      const connection = service.connect("/chat/").subscribe();
      for (let i = 1; i <= environment.websocketReconnectionMaxAttempts + 2; i++) {
        sockets.at(-1).onerror();
        vi.advanceTimersByTime(
          i >= environment.websocketReconnectionMaxAttempts
            ? Math.max(environment.websocketReconnectionInterval, 5000)
            : environment.websocketReconnectionInterval,
        );
      }
      expect(states).toEqual(["idle", "unavailable"]);
      sockets.at(-1).readyState = 1;
      sockets.at(-1).onopen();
      expect(states).toEqual(["idle", "unavailable", "connected"]);
      expect(service.isConnected).toBe(true);
      connection.unsubscribe();
      expect(sockets.at(-1).close).toHaveBeenCalled();
    });

    it("сохраняет буфер сообщений и отправляет его один раз после подключения", () => {
      const connection = service.connect("/chat/").subscribe();
      service.send("new_message", { message: "Тест" });
      const socket = sockets[0];
      socket.readyState = 1;
      socket.onopen();
      expect(socket.send).toHaveBeenCalledExactlyOnceWith(
        JSON.stringify({ type: "new_message", content: { message: "Тест" } }),
      );
      connection.unsubscribe();
    });

    it("явное закрытие не запускает новую попытку подключения", () => {
      const connection = service.connect("/chat/").subscribe();
      sockets[0].onopen();
      service.close();
      expect(sockets[0].onclose).toBeNull();
      vi.advanceTimersByTime(10000);
      expect(sockets).toHaveLength(1);
      expect(service.isConnected).toBe(false);
      connection.unsubscribe();
    });

    it("закрытие во время retry отменяет отложенное переподключение", () => {
      const completed = vi.fn();
      service.connect("/chat/").subscribe({ complete: completed });
      sockets[0].onerror();
      service.close();
      vi.advanceTimersByTime(10000);
      expect(sockets).toHaveLength(1);
      expect(completed).toHaveBeenCalledOnce();
    });
  });
});
