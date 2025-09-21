/** @format */

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html",
  styleUrl: "./vacancies.component.scss",
  imports: [CommonModule, IconComponent],
  standalone: true,
})
export class ProjectVacanciesComponent {}
