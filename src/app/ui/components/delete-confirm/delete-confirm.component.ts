/** @format */

import { Component, OnInit } from "@angular/core";
import { ModalService } from "@ui/models/modal.service";
import { ButtonComponent } from "../button/button.component";
import { IconComponent } from "../icon/icon.component";
import { NgIf, AsyncPipe } from "@angular/common";
import { ModalComponent } from "../modal/modal.component";

@Component({
    selector: "app-delete-confirm",
    templateUrl: "./delete-confirm.component.html",
    styleUrl: "./delete-confirm.component.scss",
    standalone: true,
    imports: [
        ModalComponent,
        NgIf,
        IconComponent,
        ButtonComponent,
        AsyncPipe,
    ],
})
export class DeleteConfirmComponent implements OnInit {
  constructor(public readonly modalService: ModalService) {}

  ngOnInit(): void {}

  onResult(result: boolean): void {
    this.modalService.confirmObserver?.next(result);
    this.modalService.confirmObserver?.complete();

    this.modalService.confirmState = false;
  }

  settings$ = this.modalService.confirmSettings.asObservable();
}
