/** @format */

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BarComponent } from "@ui/components";

/**
 * Главный компонент модуля отслеживания карьерных траекторий
 * Служит контейнером для дочерних компонентов и маршрутизации
 * Отображает навигационную панель с вкладками "Траектории" и "Моя траектория"
 */
@Component({
  selector: "app-track-career",
  standalone: true,
  imports: [CommonModule, BarComponent, RouterModule],
  templateUrl: "./track-career.component.html",
  styleUrl: "./track-career.component.scss",
})
export class TrackCareerComponent {}
