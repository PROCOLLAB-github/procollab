/** @format */

import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BackComponent, IconComponent } from "@uilib";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ButtonComponent } from "@ui/components";
import { SkillCardComponent } from "../shared/skill-card/skill-card.component";
import { map, Observable } from "rxjs";
import { ApiPagination } from "../../../models/api-pagination.model";
import { Skill } from "../../../models/skill.model";

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
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class SkillsListComponent implements OnInit {
  protected readonly Array = Array;
  @Input() skills!: ApiPagination<Skill>;

  router = inject(Router);
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      const data = r['data']
      this.skills = data;
    })
  }
}
