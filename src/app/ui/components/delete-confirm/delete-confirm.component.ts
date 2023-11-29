/** @format */

import { Component, OnInit } from "@angular/core";
import { ModalService } from "@ui/models/modal.service";
import { ButtonComponent, IconComponent } from "@ui/components";
import { NgIf, AsyncPipe } from "@angular/common";
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: "app-delete-confirm",
  templateUrl: "./delete-confirm.component.html",
  styleUrl: "./delete-confirm.component.scss",
  standalone: true,
  imports: [ModalComponent, NgIf, IconComponent, ButtonComponent, AsyncPipe],
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
