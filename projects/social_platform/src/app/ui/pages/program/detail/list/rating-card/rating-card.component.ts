/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ButtonDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProjectRate } from "@domain/project/project-rate";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { AppRoutes } from "@api/paths/app-routes";
import { presentationHref } from "@utils/program-case-analytics";
import { ProjectRatingComponent } from "./project-rating/project-rating.component";
import { RatingCardService } from "./services/rating-card.service";

/** One complete assessment, shared by the cabinet and the program entry. */
@Component({
  selector: "app-rating-card",
  templateUrl: "./rating-card.component.html",
  styleUrl: "./rating-card.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonDirective,
    IconComponent,
    ModalComponent,
    ProjectRatingComponent,
  ],
  providers: [RatingCardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingCardComponent {
  readonly state = inject(RatingCardService);
  readonly editor = viewChild(ProjectRatingComponent);
  readonly orderedCriteria = computed(() => {
    const criteria = this.state.project()?.criterias ?? [];
    return [...criteria.filter(c => c.type !== "str"), ...criteria.filter(c => c.type === "str")];
  });
  protected readonly AppRoutes = AppRoutes;
  protected readonly presentationHref = presentationHref;

  @Input({ required: true }) set project(value: ProjectRate | null) {
    this.state.initProject(value);
  }
  get project(): ProjectRate | null {
    return this.state.project();
  }

  hasUnsavedChanges(): boolean {
    return (
      !this.state.projectConfirmed() &&
      (!!this.editor()?.form.dirty || !!this.state.retainedAnswers().length)
    );
  }

  protected handleRateButtonClick(): void {
    if (!this.editor()?.validateAndFocus()) return;
    if (this.state.canOpenModal() && !this.state.criteriaChanged())
      this.state.showConfirmRateModal.set(true);
  }
  protected confirmRateProject(): void {
    this.state.confirmRateProject();
  }
  protected redoRating(): void {
    this.state.redoRating();
  }
  protected closeConfirmRateModal(): void {
    if (!this.state.submitLoading()) this.state.showConfirmRateModal.set(false);
  }
  protected answer(criterion: ProjectRatingCriterion): string {
    const value = this.state.form().value?.[criterion.id] ?? criterion.value;
    if (criterion.type === "bool") {
      if (value == null || value === "") return "—";
      return String(value).toLowerCase() === "true" ? "Да" : "Нет";
    }
    return value == null || value === "" ? "—" : String(value);
  }
}
