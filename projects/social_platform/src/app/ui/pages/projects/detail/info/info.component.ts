/** @format */

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectsDetailService } from "@api/project/facades/detail/projects-detail.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { ProjectsLeftSideComponent } from "./components/projects-left-side/projects-left-side.component";
import { ProjectsRightSideComponent } from "./components/projects-right-side/projects-right-side.component";
import { ProjectsMidSideComponent } from "./components/projects-mid-side/projects-mid-side.component";

/** Детальная информация о проекте: команда, новости, вакансии, подписка. */
@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterOutlet,
    CommonModule,
    ProjectsLeftSideComponent,
    ProjectsRightSideComponent,
    ProjectsMidSideComponent,
  ],
  providers: [ProjectsDetailService, ProfileDetailUIInfoService, ExpandService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly projectsDetailService = inject(ProjectsDetailService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);

  // Данные о проекте
  protected readonly project = this.projectsDetailUIInfoService.project;

  ngOnInit(): void {
    this.projectsDetailService.initializationProjectInfo();
  }

  ngAfterViewInit(): void {
    this.projectsDetailService.initCheckDescription();
  }

  ngOnDestroy(): void {
    this.projectsDetailService.destroy();
  }
}
