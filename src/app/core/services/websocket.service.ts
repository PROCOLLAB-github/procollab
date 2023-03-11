/** @format */
import { Injectable } from "@angular/core";
import { Observable, Observer, retry } from "rxjs";
import { environment } from "@environment";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket: WebSocket | null = null;

  public connect(path: string): Observable<void> {
    return new Observable((observer: Observer<void>) => {
      this.socket = new WebSocket(environment.websocketUrl + path);

      this.socket.onopen = () => {
        observer.next();
        observer.complete();
      };

      this.socket.onerror = error => {
        observer.error(error);
      };

      return () => {
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
      };
    }).pipe(
      retry({
        count: environment.websocketReconnectionMaxAttempts,
        delay: environment.websocketReconnectionInterval,
        resetOnSuccess: true,
      })
    );
  }

  public send(event: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    } else {
      throw new Error("WebSocket is not open.");
    }
  }

  public on<T>(event: string): Observable<T> {
    return new Observable((observer: Observer<T>) => {
      function handler(evt: MessageEvent) {
        const message = JSON.parse(evt.data);
        if (message.event === event) observer.next(message);
      }

      if (this.socket) {
        this.socket.addEventListener("message", handler);
      } else {
        observer.error(new Error("WebSocket is not open."));
      }

      return () => {
        if (this.socket) {
          this.socket.removeEventListener("message", handler);
        }
      };
    });
  }

  public close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
