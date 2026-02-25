/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BackComponent } from "@uilib";
import { SearchComponent } from "@ui/components/search/search.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SoonCardComponent } from "@office/shared/soon-card/soon-card.component";

/**
 * Главный компонент модуля отслеживания карьерных траекторий
 * Служит контейнером для дочерних компонентов и маршрутизации
 * Отображает навигационную панель с вкладками "Траектории" и "Моя траектория"
 */
@Component({
  selector: "app-track-career",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BackComponent,
    SearchComponent,
    ReactiveFormsModule,
    SoonCardComponent,
  ],
  templateUrl: "./courses.component.html",
  styleUrl: "./courses.component.scss",
})
export class CoursesComponent {
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  searchForm: FormGroup;
}
