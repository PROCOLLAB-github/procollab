/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { Project } from "../../../domain/project/project.model";

@Component({
  selector: "app-dashboard-item",
  templateUrl: "./dashboardItem.component.html",
  styleUrl: "./dashboardItem.component.scss",
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink, InfoCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardItemComponent implements OnInit {
  @Input() title!: string;
  @Input() arrayItems!: Project[];
  @Input() iconName!: string;
  @Input() sectionName!: string;
  @Input() profileProjSubsIds?: number[];

  @Output() addProjectClick = new EventEmitter<void>();

  appereance: "base" | "subs" | "my" = "base";

  ngOnInit(): void {
    switch (this.iconName) {
      case "favourities":
        this.appereance = "subs";
        break;

      case "main":
        this.appereance = "my";
        break;

      default:
        break;
    }
  }
}
