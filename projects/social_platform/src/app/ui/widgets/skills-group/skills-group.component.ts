/** @format */
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  Output,
  signal,
} from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { Skill } from "@domain/skills/skill.model";

/** Компонент группы навыков с множественным выбором через чекбоксы и сворачиванием. */
@Component({
  selector: "app-skills-group",
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

  readonly title = input.required<string>();
  readonly hasOpenGroups = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  @Output() groupToggled = new EventEmitter<boolean>();
  @Output() optionToggled = new EventEmitter<Skill>();

  _options = signal<(Skill & { checked?: boolean })[]>([]);
  _selected = signal<Skill[]>([]);
  contentVisible = signal(false);

  toggleContentVisible() {
    if (this.disabled()) {
      return;
    }

    this.contentVisible.update(val => !val);
    this.groupToggled.emit(this.contentVisible());
  }

  onOptionClick(opt: Skill) {
    if (this.disabled()) {
      return;
    }

    this.optionToggled.emit(opt);
  }
}
