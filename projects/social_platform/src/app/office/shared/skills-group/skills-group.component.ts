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
import { Skill } from "@office/models/skill";

@Component({
  selector: "app-skills-group",
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: "./skills-group.component.html",
  styleUrl: "./skills-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsGroupComponent {
  @Input({ required: true }) set options(value: Skill[]) {
    this._options.set(value);
  }

  get options(): (Skill & { checked?: boolean })[] {
    return this._options();
  }

  @Input({ required: true }) set selected(value: Skill[]) {
    this._selected.set(value);

    const options = this.options.map(opt => {
      return { ...opt, checked: value.some(skill => skill.id === opt.id) };
    });

    this._options.set(options);
  }

  get selected(): Skill[] {
    return this._selected();
  }

  @Input({ required: true }) title!: string;

  @Output() optionToggled = new EventEmitter<Skill>();

  _options = signal<(Skill & { checked?: boolean })[]>([]);

  _selected = signal<Skill[]>([]);

  contentVisible = signal(false);

  toggleContentVisible(): void {
    this.contentVisible.update(visible => !visible);
  }
}
