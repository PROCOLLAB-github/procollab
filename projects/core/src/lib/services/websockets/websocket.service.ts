/** @format */
import { inject, Injectable } from "@angular/core";
import { filter, map, Observable, Observer, retry, Subject, timer } from "rxjs";
import { environment } from "@environment";
import * as snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";
import { TokenService } from "../tokens/token.service";

/**
 * Сервис для работы с WebSocket соединениями
 * Предоставляет методы для подключения, отправки сообщений и прослушивания событий
 * Автоматически преобразует ключи объектов между camelCase и snake_case
 * Поддерживает автоматическое переподключение при разрыве соединения
 */
@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  /** Экземпляр WebSocket соединения */
  private socket: WebSocket | null = null;
  /** Subject для обработки входящих сообщений */
  private messages$ = new Subject<MessageEvent>();
  /** Subject потери соединения (после исчерпания retry) — приватный, наружу только Observable */
  private readonly _connectionLost$ = new Subject<void>();
  /** Сигнал потери WS-соединения. Потребитель отвечает за UX (toast/banner/etc). */
  public readonly connectionLost$ = this._connectionLost$.asObservable();
  /** Буфер исходящих сообщений, накопленных пока сокет не OPEN — флашится в onopen. */
  private outboundQueue: string[] = [];

  private readonly tokenService = inject(TokenService);

  /** Флаг состояния соединения */
  public isConnected = false;

  /**
   * Устанавливает WebSocket соединение
   *
   * @param path - путь для подключения (добавляется к базовому websocketUrl)
   * @returns Observable<void> - Observable, который эмитит при успешном подключении
   *
   * Особенности:
   * - Автоматически переподключается при разрыве соединения
   * - Количество попыток и интервал настраиваются через environment
   * - Все входящие сообщения перенаправляются в messages$ Subject
   */
  public connect(path: string): Observable<void> {
    return new Observable((observer: Observer<void>) => {
      const tokens = this.tokenService.getTokens();

      const tokenAccess = tokens?.access ? tokens.access : "";

      this.socket = new WebSocket(environment.websocketUrl + path, ["Bearer", tokenAccess]);

      this.socket.onopen = () => {
        this.isConnected = true;
        // Отправляем всё, что накопилось пока сокет был CONNECTING.
        const flush = this.outboundQueue;
        this.outboundQueue = [];
        flush.forEach(payload => this.socket?.send(payload));
        observer.next();
      };

      this.socket.onerror = error => {
        this.isConnected = false;
        observer.error(error);
      };

      // Любое закрытие сокета (хоть «чистое» с code=1000, хоть 1006) — повод переподключиться.
      // Сервер часто закрывает «чисто» по своему timeout, и тогда wasClean=true, но connection всё равно мёртв.
      this.socket.onclose = () => {
        this.isConnected = false;
        observer.error(new Error("WebSocket closed"));
      };

      this.socket.onmessage = message => {
        this.messages$.next(message);
      };
    }).pipe(
      // Resilient reconnect: НЕ сдаёмся насовсем по исчерпании попыток.
      // Первые maxAttempts — частые попытки (быстрое восстановление после idle-close сервера);
      // дальше — реже (бэкофф) + сигнал connectionLost$ для UX, но переподключение продолжается бесконечно.
      // resetOnSuccess сбрасывает счётчик после каждого успешного onopen.
      retry({
        delay: (_error, retryCount) => {
          if (retryCount >= environment.websocketReconnectionMaxAttempts) {
            this._connectionLost$.next();
            return timer(Math.max(environment.websocketReconnectionInterval, 5000));
          }
          return timer(environment.websocketReconnectionInterval);
        },
        resetOnSuccess: true,
      })
    );
  }

  /**
   * Отправляет сообщение через WebSocket
   *
   * @param type - тип сообщения
   * @param content - содержимое сообщения (любой объект)
   *
   * Если сокет не OPEN — сообщение копится в outboundQueue и отправляется на следующем onopen
   * (не бросает исключение). Автоматически преобразует ключи content в snake_case.
   */
  public send(type: string, content: any): void {
    const payload = JSON.stringify({
      type,
      content: snakecaseKeys(content, { deep: true }),
    });

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      return;
    }

    // CONNECTING (handshake) или CLOSED/CLOSING (auto-reconnect ещё не успел) — копим, отправим на следующем onopen.
    this.outboundQueue.push(payload);
  }

  /**
   * Подписывается на сообщения определенного типа
   *
   * @param type - тип сообщений для прослушивания
   * @returns Observable<T> - Observable с сообщениями указанного типа
   *
   * Особенности:
   * - Фильтрует сообщения по типу
   * - Автоматически парсит JSON
   * - Преобразует ключи из snake_case в camelCase
   */
  public on<T>(type: string): Observable<T> {
    return this.messages$.asObservable().pipe(
      map(message => JSON.parse(message.data)),
      filter(message => message.type === type),
      map(message => camelcaseKeys(message.content, { deep: true }))
    );
  }

  /**
   * Закрывает WebSocket соединение
   * Очищает ссылку на socket и сбрасывает флаг подключения
   */
  public close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}
