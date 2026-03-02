/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { PluralizePipe } from "@corelib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { Skill } from "../../../domain/skills/skill";

@Component({
  selector: "app-approve-skill-people",
  templateUrl: "./approve-skill-people.component.html",
  styleUrl: "./approve-skill-people.component.scss",
  imports: [CommonModule, AvatarComponent, PluralizePipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveSkillPeopleComponent {
  @Input({ required: true }) approves!: Skill["approves"];
}
