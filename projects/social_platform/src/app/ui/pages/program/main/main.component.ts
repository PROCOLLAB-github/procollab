/** @format */

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CheckboxComponent, SelectComponent } from "@ui/primitives";
import { ClickOutsideModule } from "ng-click-outside";
import { ProgramCardComponent } from "./program-card/program-card.component";
import { ProgramMainUIInfoService } from "@api/program/facades/ui/program-main-ui-info.service";
import { ProgramMainInfoService } from "@api/program/facades/program-main-info.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Отображает список программ с поиском и фильтрацией. */
@Component({
    selector: "app-main",
    templateUrl: "./main.component.html",
    styleUrl: "./main.component.scss",
    imports: [
        RouterLink,
        ProgramCardComponent,
        CheckboxComponent,
        SelectComponent,
        ClickOutsideModule,
    ],
    providers: [ProgramMainInfoService, ProgramMainUIInfoService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramMainComponent implements OnInit, OnDestroy {
  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);
  private readonly programMainInfoService = inject(ProgramMainInfoService);

  protected readonly programs = this.programMainUIInfoService.programs;
  protected readonly isPparticipating = this.programMainUIInfoService.isPparticipating;
  protected readonly programOptionsFilter = this.programMainUIInfoService.programOptionsFilter;
  protected readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    this.programMainInfoService.initializationMainPrograms();
  }

  /**
   * Переключает состояние чекбокса "участвую"
   */
  onTogglePparticipating(): void {
    this.programMainInfoService.onTogglePparticipating();
  }

  ngOnDestroy(): void {
    this.programMainInfoService.destroy();
  }
}
