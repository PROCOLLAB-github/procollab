/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input, Input, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/primitives";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ApproveSkillPeopleComponent } from "./approve-skill-people/approve-skill-people.component";
import { Skill } from "@domain/skills/skill.model";
import { ApproveskillInfoService } from "./services/approve-skill-info.service";
import { ApproveSkillUIInfoService } from "./services/approve-skill-ui-info.service";

/** Компонент подтверждения навыка пользователя. */
@Component({
  selector: "app-approve-skill",
  styleUrl: "./approve-skill.component.scss",
  templateUrl: "./approve-skill.component.html",
  imports: [CommonModule, ButtonComponent, ModalComponent, ApproveSkillPeopleComponent],
  providers: [ApproveskillInfoService, ApproveSkillUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveSkillComponent implements OnInit {
  private readonly approveskillInfoService = inject(ApproveskillInfoService);
  private readonly approveSkillUIInfoService = inject(ApproveSkillUIInfoService);

  isUserApproveSkill(skill: Skill): boolean {
    return this.approveskillInfoService.isUserApproveSkill(skill);
  }

  protected readonly approveOwnSkillModal = this.approveSkillUIInfoService.approveOwnSkillModal;

  readonly skill = input.required<Skill>();

  ngOnInit(): void {
    this.approveskillInfoService.init();
  }

  onToggleApprove(skillId: number, event: Event, skill: Skill) {
    this.approveskillInfoService.onToggleApprove(skillId, event, skill);
  }
}
