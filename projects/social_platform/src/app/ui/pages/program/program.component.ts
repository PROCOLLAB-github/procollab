/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { BackComponent } from "@uilib";
import { ProgramInfoService } from "@api/program/facades/program-info.service";
import { ProgramMainUIInfoService } from "@api/program/facades/ui/program-main-ui-info.service";

/** Контейнер модуля программ с поиском и навигацией. */
@Component({
    selector: "app-program",
    templateUrl: "./program.component.html",
    styleUrl: "./program.component.scss",
    imports: [ReactiveFormsModule, SearchComponent, RouterOutlet, BackComponent],
    providers: [ProgramInfoService, ProgramMainUIInfoService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramComponent implements OnInit {
  private readonly programInfoService = inject(ProgramInfoService);
  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);

  protected readonly searchForm = this.programMainUIInfoService.searchForm;

  ngOnInit(): void {
    this.programInfoService.initializationPrograms();
  }
}
