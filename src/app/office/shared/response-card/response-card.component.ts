/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { VacancyResponse } from "@models/vacancy-response.model";

@Component({
  selector: "app-response-card",
  templateUrl: "./response-card.component.html",
  styleUrl: "./response-card.component.scss",
})
export class ResponseCardComponent implements OnInit {
  constructor() {}

  @Input() response?: VacancyResponse;
  @Output() reject = new EventEmitter<number>();
  @Output() accept = new EventEmitter<number>();

  ngOnInit(): void {}
}
