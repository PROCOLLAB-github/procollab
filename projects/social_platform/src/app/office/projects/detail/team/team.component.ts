/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { IconComponent } from "@uilib";
import { ProjectDataService } from "../services/project-data.service";
import { Collaborator } from "@office/models/collaborator.model";
import { InfoCardComponent } from "@office/shared/info-card/info-card.component";

@Component({
  selector: "app-project-eam",
  templateUrl: "./team.component.html",
  styleUrl: "./team.component.scss",
  imports: [CommonModule, IconComponent, InfoCardComponent],
  standalone: true,
})
export class ProjectTeamComponent implements OnInit {
  private readonly projectDataService = inject(ProjectDataService);

  ngOnInit(): void {
    this.projectDataService.getTeam().subscribe({
      next: team => {
        this.team = team;
      },
    });
  }

  team?: Collaborator[];
}
