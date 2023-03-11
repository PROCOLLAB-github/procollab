/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Observer } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  constructor() {}

  confirmObserver?: Observer<boolean>;
  confirmSettings = new BehaviorSubject<{ mainText: string; subText: string }>({
    mainText: "",
    subText: "",
  });

  confirmState = false;

  confirmDelete(mainText: string, subText: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.confirmState = true;

      this.confirmObserver = observer;
      this.confirmSettings.next({
        mainText,
        subText,
      });
    });
  }
}
