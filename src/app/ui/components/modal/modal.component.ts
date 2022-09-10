/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent implements OnInit {
  constructor() {}

  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  ngOnInit(): void {}
}
