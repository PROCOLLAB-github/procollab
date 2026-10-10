/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../ui/src/lib/services/desktop-layout.service";

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BackComponent, FormLayoutDirective, PageHeaderComponent } from "@uilib";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SoonCardComponent } from "@ui/primitives/soon-card/soon-card.component";

/** Контейнер модуля карьерных траекторий. */
@Component({
  selector: "app-track-career",
  imports: [
    PageHeaderComponent,
    FormLayoutDirective,
    CommonModule,
    RouterModule,
    BackComponent,
    SearchComponent,
    ReactiveFormsModule,
    SoonCardComponent,
  ],
  templateUrl: "./courses.component.html",
  styleUrl: "./courses.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  private readonly fb = inject(FormBuilder);

  constructor() {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  searchForm: FormGroup;
}
