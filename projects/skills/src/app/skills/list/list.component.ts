/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BackComponent, IconComponent } from "@uilib";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { BarComponent, ButtonComponent } from "@ui/components";
import { SkillCardComponent } from "../shared/skill-card/skill-card.component";
import { map, Observable } from "rxjs";
import { ApiPagination } from "../../../models/api-pagination.model";
import { Skill } from "../../../models/skill.model";
import { WriteTaskComponent } from "../../task/shared/write-task/write-task.component";
import { SkillService } from "../services/skill.service";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    CommonModule,
    BackComponent,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    ButtonComponent,
    SkillCardComponent,
    BarComponent,
    WriteTaskComponent,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class SkillsListComponent {
  protected readonly Array = Array;
  router = inject(Router);
  route = inject(ActivatedRoute);
  private readonly skillService = inject(SkillService);

  skills = this.route.data.pipe(map(r => r["data"])) as Observable<ApiPagination<Skill>>;

  onSkillClick(skillId: number) {
    this.skillService.setSkillId(skillId);
    this.router.navigate(["skills", skillId]);
  }
}
