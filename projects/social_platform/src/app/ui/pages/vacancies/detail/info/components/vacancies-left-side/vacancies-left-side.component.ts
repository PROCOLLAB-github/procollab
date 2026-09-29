/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancySkillsComponent } from "@ui/widgets/vacancy-skills/vacancy-skills.component";
@Component({
  selector: "app-vacancies-left-side",
  templateUrl: "./vacancies-left-side.component.html",
  styleUrl: "./vacancies-left-side.component.scss",
  imports: [ParseBreaksPipe, ParseLinksPipe, VacancySkillsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesLeftSideComponent {
  readonly vacancy = input.required<Vacancy | undefined>();
}
