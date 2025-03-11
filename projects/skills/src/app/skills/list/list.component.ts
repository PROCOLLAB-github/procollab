/** @format */

import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BackComponent, IconComponent } from "@uilib";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { BarComponent, ButtonComponent } from "@ui/components";
import { SkillCardComponent } from "../shared/skill-card/skill-card.component";
import { map, Observable, Subscription } from "rxjs";
import { ApiPagination } from "../../../models/api-pagination.model";
import { Skill } from "../../../models/skill.model";
import { WriteTaskComponent } from "../../task/shared/write-task/write-task.component";
import { SkillService } from "../services/skill.service";
import { ProfileService } from "../../profile/services/profile.service";
import { SubscriptionData } from "@corelib";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent,
    SkillCardComponent,
    BarComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class SkillsListComponent implements OnInit, OnDestroy {
  constructor(private readonly fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: ["", [Validators.required]],
    });
  }

  searchForm: FormGroup;

  router = inject(Router);
  route = inject(ActivatedRoute);
  subscriptions: Subscription[] = [];

  private readonly skillService = inject(SkillService);
  private readonly profileService = inject(ProfileService);

  skills = signal<Skill[]>([]);
  originalSkills = signal<Skill[]>([]);
  subscriptionType = signal<SubscriptionData["lastSubscriptionType"]>(null);

  ngOnInit(): void {
    const profileSub = this.profileService.getSubscriptionData().subscribe(r => {
      this.subscriptionType.set(r.lastSubscriptionType);
    });

    const skillsSub = this.route.data.pipe(map(r => r["data"])).subscribe(({ results }) => {
      this.skills.set(results);
      this.originalSkills.set(results);
    });

    this.subscriptions.push(profileSub);
    this.subscriptions.push(skillsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSearchClick() {
    const searchTerm = this.searchForm.get("search")?.value?.trim().toLowerCase();

    if (!searchTerm) {
      this.skills.set(this.originalSkills());
      return;
    }

    const filteredSkills = this.originalSkills().filter(skill =>
      skill.name.toLowerCase().includes(searchTerm)
    );

    this.skills.set(filteredSkills);
  }

  onSkillClick(skillId: number) {
    this.skillService.setSkillId(skillId);
    this.router.navigate(["skills", skillId]);
  }
}
