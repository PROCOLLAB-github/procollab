/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BackComponent } from "@uilib";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SoonCardComponent } from "@ui/primitives/soon-card/soon-card.component";

/** Контейнер модуля карьерных траекторий. */
@Component({
    selector: "app-track-career",
    imports: [
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
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  searchForm: FormGroup;
}
