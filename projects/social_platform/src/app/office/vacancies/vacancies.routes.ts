import { Routes } from "@angular/router";
import { VacanciesComponent } from "./vacancies.component";
import { VacanciesResolver } from "./vacancies.resolver";

export const VACANCIES_ROUTES: Routes = [
  {
    path: "",
    component: VacanciesComponent,
    resolve: { data: VacanciesResolver }
  }
]
