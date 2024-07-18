/** @format */
import { Injectable } from "@angular/core";
import { filter, map, Observable, Observer, retry, Subject } from "rxjs";
import { environment } from "@environment";
import * as snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private messages$ = new Subject<MessageEvent>();

  public isConnected = false;
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
      }),
    );
  }

  public send(type: string, content: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, content: snakecaseKeys(content, { deep: true }) }));
    } else {
      throw new Error("WebSocket is not open.");
    }
  }

  public on<T>(type: string): Observable<T> {
    return this.messages$.asObservable().pipe(
      map(message => JSON.parse(message.data)),
      filter(message => message.type === type),
      map(message => camelcaseKeys(message.content, { deep: true })),
    );
  }

  public close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;

      this.isConnected = false;
    }
  }
}
