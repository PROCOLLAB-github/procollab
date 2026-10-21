/** @format */

import { A11yModule } from "@angular/cdk/a11y";
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { Skill } from "@domain/skills/skill.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { ButtonDirective, IconComponent } from "@uilib";

/** Просмотр уже загруженных навыков профиля без изменения данных и их порядка. */
@Component({
  selector: "app-profile-skills-dialog",
  imports: [A11yModule, ModalComponent, TagComponent, ButtonDirective, IconComponent],
  templateUrl: "./profile-skills-dialog.component.html",
  styleUrl: "./profile-skills-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSkillsDialogComponent {
  readonly open = input(false);
  readonly skills = input<readonly Skill[]>([]);
  readonly openChange = output<boolean>();
}
