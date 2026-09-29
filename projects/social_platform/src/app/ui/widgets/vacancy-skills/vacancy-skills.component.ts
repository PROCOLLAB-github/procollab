/** @format */

import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from "@angular/core";
import { TagComponent } from "@ui/primitives/tag/tag.component";

interface VacancySkill {
  id?: number;
  name: string;
  category?: { name: string } | null;
}

@Component({
  selector: "app-vacancy-skills",
  imports: [TagComponent],
  template: `
    @if (skills().length) {
      <ul class="skills" aria-label="Навыки">
        @for (skill of visibleSkills(); track $index) {
          <li>
            <app-tag
              class="skill"
              [class.skill--soft]="skill.category?.name?.includes('Soft')"
              appearance="outline"
              >{{ skill.name }}</app-tag
            >
          </li>
        }
        @if (skills().length > limit()) {
          <li>
            <button
              type="button"
              class="skills__toggle"
              [attr.aria-expanded]="expanded()"
              (click)="expanded.set(!expanded())"
            >
              {{ expanded() ? "Свернуть" : "Ещё +" + (skills().length - limit()) }}
            </button>
          </li>
        }
      </ul>
    } @else {
      <p class="skills__empty">Навыки не указаны</p>
    }
  `,
  styleUrl: "./vacancy-skills.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancySkillsComponent {
  readonly skills = input<readonly VacancySkill[]>([]);
  readonly limit = input(5);
  readonly expanded = signal(false);
  readonly visibleSkills = computed(() =>
    this.expanded() ? this.skills() : this.skills().slice(0, this.limit()),
  );
  constructor() {
    effect(() => {
      this.skills();
      this.expanded.set(false);
    });
  }
}
