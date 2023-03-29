/** @format */

import { Component, OnInit } from "@angular/core";
import { ModalService } from "@ui/models/modal.service";

@Component({
  selector: "app-delete-confirm",
  templateUrl: "./delete-confirm.component.html",
  styleUrls: ["./delete-confirm.component.scss"],
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
