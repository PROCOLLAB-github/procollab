/** @format */

import { Injectable } from "@angular/core";
import { distinctUntilChanged, Subject } from "rxjs";
import { Snack } from "@ui/models/snack.model";
import { nanoid } from "nanoid";

@Injectable({
  providedIn: "root",
})
export class SnackbarService {
  constructor() {}

  private snacks$ = new Subject<Snack>();
  snacks = this.snacks$.asObservable().pipe(distinctUntilChanged());

  success(text: string, options: { timeout: number } = { timeout: 5000 }): void {
    this.snacks$.next({ id: nanoid(), text, timeout: options.timeout, type: "success" });
  }

  error(text: string, options: { timeout: number } = { timeout: 5000 }): void {
    this.snacks$.next({ id: nanoid(), text, timeout: options.timeout, type: "error" });
  }

  info(text: string, options: { timeout: number } = { timeout: 5000 }): void {
    this.snacks$.next({ id: nanoid(), text, timeout: options.timeout, type: "info" });
  }
}
