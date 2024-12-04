/** @format */

import { JsonPipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Vacancy } from "@models/vacancy.model";
import { IconComponent } from "@ui/components";

@Component({
  selector: "app-vacancy-card",
  templateUrl: "./vacancy-card.component.html",
  styleUrl: "./vacancy-card.component.scss",
  standalone: true,
  imports: [IconComponent, JsonPipe],
})
export class VacancyCardComponent implements OnInit {
  constructor() {}

  @Input() vacancy?: Vacancy;
  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  skillString = "";

  ngOnInit(): void {
    this.skillString = this.vacancy?.requiredSkills.map(s => s.name).join(" • ") ?? "";
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.vacancy?.id);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.edit.emit(this.vacancy?.id);
  }
}
