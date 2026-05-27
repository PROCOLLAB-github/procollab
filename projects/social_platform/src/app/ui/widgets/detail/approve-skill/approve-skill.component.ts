/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
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
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, ApproveSkillPeopleComponent],
  providers: [ApproveskillInfoService, ApproveSkillUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveSkillComponent implements OnInit, OnDestroy {
  private readonly approveskillInfoService = inject(ApproveskillInfoService);
  private readonly approveSkillUIInfoService = inject(ApproveSkillUIInfoService);

  isUserApproveSkill(skill: Skill): boolean {
    return this.approveskillInfoService.isUserApproveSkill(skill);
  }

  protected readonly approveOwnSkillModal = this.approveSkillUIInfoService.approveOwnSkillModal;

  @Input({ required: true }) skill!: Skill;

  ngOnInit(): void {
    this.approveskillInfoService.init();
  }

  ngOnDestroy(): void {
    this.approveskillInfoService.destroy();
  }

  onToggleApprove(skillId: number, event: Event, skill: Skill) {
    this.approveskillInfoService.onToggleApprove(skillId, event, skill);
  }
}
