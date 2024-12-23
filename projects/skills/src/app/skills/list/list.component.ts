/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
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
import { ProfileService } from "../../profile/services/profile.service";
import { SubscriptionData } from "@corelib";

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
export class SkillsListComponent implements OnInit {
  protected readonly Array = Array;
  router = inject(Router);
  route = inject(ActivatedRoute);
  private readonly skillService = inject(SkillService);
  private readonly profileService = inject(ProfileService);

  skills = this.route.data.pipe(map(r => r["data"])) as Observable<ApiPagination<Skill>>;
  isSubscribed = signal(false);
  subscriptionType = signal<SubscriptionData["lastSubscriptionType"]>(null);

  ngOnInit(): void {
    this.profileService.getSubscriptionData().subscribe(r => {
      this.isSubscribed.set(r.isSubscribed);
      this.subscriptionType.set(r.lastSubscriptionType); // TODO На будущую проверку для скиллов если появиться в будущем
    });
  }

  onSkillClick(skillId: number) {
    if (this.isSubscribed()) {
      this.skillService.setSkillId(skillId);
      this.router.navigate(["skills", skillId]);
    } else this.router.navigate(["subscription"]);
  }
}
