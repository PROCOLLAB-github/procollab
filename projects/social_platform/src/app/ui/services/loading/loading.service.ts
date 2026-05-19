/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

/** Глобальный флаг загрузки (`isLoading$`); связан с прогресс-баром в `app.component` через router-события. */
@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private _isLoading$ = new BehaviorSubject<boolean>(false);

  get isLoading$(): Observable<boolean> {
    return this._isLoading$.asObservable();
  }

  show(): void {
    this._isLoading$.next(true);
  }

  hide(): void {
    this._isLoading$.next(false);
  }

  toggle(): void {
    this._isLoading$.next(!this._isLoading$.value);
  }
}
