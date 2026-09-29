/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { AutoCompleteInputComponent } from "@ui/primitives/autocomplete-input/autocomplete-input.component";
import { Specialization } from "@domain/specializations/specialization.model";
import { MembersComponent } from "@ui/pages/members/members.component";
import { Skill } from "@domain/skills/skill.model";
import { SearchesService } from "@api/searches/searches.service";

/** Фильтры для списка участников с синхронизацией через URL. */
@Component({
  selector: "app-members-filters",
  imports: [CommonModule, ReactiveFormsModule, AutoCompleteInputComponent],
  templateUrl: "./members-filters.component.html",
  styleUrl: "./members-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersFiltersComponent {
  readonly filterForm = input.required<MembersComponent["filterForm"]>();
  readonly resetRequested = output<void>();

  private readonly searchesService = inject(SearchesService);

  protected readonly specsOptions = this.searchesService.inlineSpecs;

  protected readonly skillsOptions = this.searchesService.inlineSkills;

  onSelectSpec(speciality: Specialization): void {
    this.filterForm().patchValue({ speciality: speciality.name });
  }

  onClearSpecField(): void {
    this.filterForm().patchValue({ speciality: "" });
  }

  onSearchSpec(query: string): void {
    this.searchesService.onSearchSpec(query);
  }

  onSelectSkill(skill: Skill): void {
    this.filterForm().patchValue({ keySkill: skill.name });
  }

  onClearSkillField(): void {
    this.filterForm().patchValue({ keySkill: "" });
  }

  onSearchSkill(query: string): void {
    this.searchesService.onSearchSkill(query);
  }

  onToggleStudentMosPolitech(): void {
    this.filterForm().patchValue({
      isMosPolytechStudent: !this.filterForm().get("isMosPolytechStudent")?.value,
    });
  }

  clearFilters(): void {
    this.resetRequested.emit();
  }
}
