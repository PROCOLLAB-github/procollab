/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { IconComponent } from "@ui/components";
import { RangeInputComponent } from "@ui/components/range-input/range-input.component";
import { MembersComponent } from "@office/members/members.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { Specialization } from "@office/models/specialization";
import { SpecializationsService } from "@office/services/specializations.service";
import { SkillsService } from "@office/services/skills.service";
import { Skill } from "@office/models/skill";
import { ActivatedRoute, Router } from "@angular/router";
import { CheckboxComponent } from "../../../ui/components/checkbox/checkbox.component";

@Component({
  selector: "app-members-filters",
  standalone: true,
  imports: [
    CommonModule,
    RangeInputComponent,
    IconComponent,
    ReactiveFormsModule,
    AutoCompleteInputComponent,
    CheckboxComponent,
  ],
  templateUrl: "./members-filters.component.html",
  styleUrl: "./members-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersFiltersComponent {
  @Output() filtersChanged = new EventEmitter();

  @Input({ required: true }) filterForm!: MembersComponent["filterForm"];

  specsOptions = signal<Specialization[]>([]);

  skillsOptions = signal<Skill[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly specsService: SpecializationsService,
    private readonly skillsService: SkillsService
  ) {}

  onSelectSpec(speciality: Specialization): void {
    this.filterForm.patchValue({ speciality: speciality.name });
  }

  onClearSpecField(): void {
    this.filterForm.patchValue({ speciality: "" });
  }

  onSearchSpec(query: string): void {
    this.specsService.getSpecializationsInline(query, 1000, 0).subscribe(({ results }) => {
      this.specsOptions.set(results);
    });
  }

  onSelectSkill(skill: Skill): void {
    this.filterForm.patchValue({ keySkill: skill.name });
  }

  onClearSkillField(): void {
    this.filterForm.patchValue({ keySkill: "" });
  }

  onSearchSkill(query: string): void {
    this.skillsService.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.skillsOptions.set(results);
    });
  }

  onToggleStudentMosPolitech(): void {
    this.filterForm.patchValue({
      isMosPolytechStudent: !this.filterForm.get("isMosPolytechStudent")?.value,
    });
  }

  clearFilters(): void {
    this.router
      .navigate([], {
        queryParams: {
          fullname: undefined,
          is_mospolytech_student: undefined,
          skills__contains: undefined,
          speciality__icontains: undefined,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.log("Query change from ProjectsComponent"));

    this.filterForm.reset();
  }
}
