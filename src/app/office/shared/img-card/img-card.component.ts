/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-img-card",
  templateUrl: "./img-card.component.html",
  styleUrls: ["./img-card.component.scss"],
})
export class ImgCardComponent implements OnInit {
  constructor() {}

  @Input() src = "";
  @Input() error = false;
  @Input() loading = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();
  ngOnInit(): void {}
}