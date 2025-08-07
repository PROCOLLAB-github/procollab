/** @format */
import { Injectable } from "@angular/core";
import { filter, map, Observable, Observer, retry, Subject } from "rxjs";
import { environment } from "@environment";
import * as snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";

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
      this.socket = new WebSocket(environment.websocketUrl + path);

      this.socket.onopen = () => {
        this.isConnected = true;
        observer.next();
      };

      this.socket.onerror = error => {
        this.isConnected = false;
        observer.error(error);
      };

      this.socket.onmessage = message => {
        this.messages$.next(message);
      };
    }).pipe(
      retry({
        count: environment.websocketReconnectionMaxAttempts,
        delay: environment.websocketReconnectionInterval,
        resetOnSuccess: true,
      })
    );
  }

  /**
   * Отправляет сообщение через WebSocket
   *
   * @param type - тип сообщения
   * @param content - содержимое сообщения (любой объект)
   * @throws Error если WebSocket не открыт
   *
   * Автоматически преобразует ключи content в snake_case перед отправкой
   */
  public send(type: string, content: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type,
          content: snakecaseKeys(content, { deep: true }),
        })
      );
    } else {
      throw new Error("WebSocket is not open.");
    }
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
