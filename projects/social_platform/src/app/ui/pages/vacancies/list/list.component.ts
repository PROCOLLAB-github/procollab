/** @format */

// list.component.ts
/** @format */

import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, IconComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProjectVacancyCardComponent } from "@ui/shared/project-vacancy-card/project-vacancy-card.component";
import { ResponseCardComponent } from "@ui/components/response-card/response-card.component";
import { VacancyUIInfoService } from "projects/social_platform/src/app/api/vacancy/facades/ui/vacancy-ui-info.service";
import { VacancyInfoService } from "projects/social_platform/src/app/api/vacancy/facades/vacancy-info.service";

@Component({
  selector: "app-vacancies-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  imports: [
    CommonModule,
    ResponseCardComponent,
    ProjectVacancyCardComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VacancyInfoService, VacancyUIInfoService],
  standalone: true,
})
export class VacanciesListComponent {
  private readonly vacancyInfoService = inject(VacancyInfoService);
  private readonly vacancyUIInfoService = inject(VacancyUIInfoService);

  protected readonly type = this.vacancyUIInfoService.listType;
  protected readonly vacancyList = this.vacancyUIInfoService.vacancyList;
  protected readonly responsesList = this.vacancyUIInfoService.responsesList;
  protected readonly isMyModal = this.vacancyUIInfoService.isMyModal;

  ngOnInit() {
    this.vacancyInfoService.init();
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target) {
      this.vacancyInfoService.initScroll(target);
    }
  }

  ngOnDestroy() {
    this.vacancyInfoService.destroy();
  }
}
