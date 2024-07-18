/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
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

@Component({
  selector: "app-members-filters",
  standalone: true,
  imports: [
    CommonModule,
    RangeInputComponent,
    IconComponent,
    ReactiveFormsModule,
    AutoCompleteInputComponent,
  ],
  templateUrl: "./members-filters.component.html",
  styleUrl: "./members-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersFiltersComponent {
  @Output() filtersChanged = new EventEmitter();
  filtersOpen = false;

  @Input({ required: true }) filterForm!: MembersComponent["filterForm"];

  specsOptions = signal<Specialization[]>([]);

  skillsOptions = signal<Skill[]>([]);

  constructor(
    private readonly specsService: SpecializationsService,
    private readonly skillsService: SkillsService,
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
}
