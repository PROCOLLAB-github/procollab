/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Vacancy } from "@models/vacancy.model";
import { IconComponent } from "@ui/components";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-vacancy-card",
  templateUrl: "./vacancy-card.component.html",
  styleUrl: "./vacancy-card.component.scss",
  standalone: true,
  imports: [NgIf, IconComponent],
})
export class VacancyCardComponent implements OnInit {
  constructor() {}

  @Input() vacancy?: Vacancy;
  @Output() remove = new EventEmitter<number>();

  ngOnInit(): void {}

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.vacancy?.id);
  }
}
