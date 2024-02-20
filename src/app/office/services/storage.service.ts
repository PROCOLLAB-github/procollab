/** @format */

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  setItem(key: string, value: any, storage = localStorage) {
    if (typeof value === "object") storage.setItem(key, JSON.stringify(value));
    else storage.setItem(key, value);
  }

  getItem<T>(key: string, storage = localStorage): T | null {
    const value = storage.getItem(key);
    if (!value) return null;

    const parsedValue = JSON.parse(value);

    return parsedValue as T;
  }
}
