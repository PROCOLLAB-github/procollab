/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
  ChangeDetectionStrategy,
  viewChild,
} from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { CommonModule } from "@angular/common";
import { BreakpointObserver } from "@angular/cdk/layout";
import { ProjectRatingComponent } from "./project-rating/project-rating.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TruncatePipe, ControlErrorPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { ProjectRate } from "@domain/project/project-rate";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { RatingCardService } from "./services/rating-card.service";
import { ExpandService } from "@api/expand/expand.service";
import { map } from "rxjs";

/** Карточка оценки проекта экспертом: форма с критериями, навигация, переоценка. */
@Component({
  selector: "app-rating-card",
  templateUrl: "./rating-card.component.html",
  styleUrl: "./rating-card.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    ProjectRatingComponent,
    ControlErrorPipe,
    RouterLink,
    TagComponent,
    ModalComponent,
    TruncatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RatingCardService, ExpandService],
})
export class RatingCardComponent implements AfterViewInit {
  private readonly ratingCardService = inject(RatingCardService);
  private readonly expandService = inject(ExpandService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly AppRoutes = AppRoutes;
  private readonly industryRepository = inject(IndustryRepositoryPort);

  private readonly descEl = viewChild<ElementRef | undefined>("descEl");

  @Input({ required: true }) set project(proj: ProjectRate | null) {
    this.ratingCardService.initProject(proj);
  }

  get project(): ProjectRate | null {
    return this.ratingCardService.project();
  }

  protected readonly desktopMode$ = this.breakpointObserver
    .observe("(min-width: 1000px)")
    .pipe(map(result => result.matches));

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

  protected readonly ratedCount = this.ratingCardService.ratedCount;
  protected readonly isProjectCriterias = this.ratingCardService.isProjectCriterias;
  protected readonly form = this.ratingCardService.form;
  protected readonly profile = this.ratingCardService.profile;
  protected readonly projectRated = this.ratingCardService.projectRated;
  protected readonly projectConfirmed = this.ratingCardService.projectConfirmed;
  protected readonly isRatedByCurrentUser = this.ratingCardService.isRatedByCurrentUser;
  protected readonly programDateFinished = this.ratingCardService.programDateFinished;
  protected readonly showRatingForm = this.ratingCardService.showRatingForm;
  protected readonly showRatedStatus = this.ratingCardService.showRatedStatus;
  protected readonly showConfirmedState = this.ratingCardService.showConfirmedState;
  protected readonly submitLoading = this.ratingCardService.submitLoading;
  protected readonly confirmLoading = this.ratingCardService.confirmLoading;
  protected readonly isButtonDisabled = this.ratingCardService.isButtonDisabled;
  protected readonly buttonOpacity = this.ratingCardService.buttonOpacity;
  protected readonly buttonColor = this.ratingCardService.buttonColor;
  protected readonly buttonTooltip = this.ratingCardService.buttonTooltip;
  protected readonly rateButtonText = this.ratingCardService.rateButtonText;
  protected readonly showEditButton = this.ratingCardService.showEditButton;
  protected readonly showConfirmRateModal = this.ratingCardService.showConfirmRateModal;

  protected readonly industryRepositoryGetOne = (id: number) => this.industryRepository.getOne(id);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.expandService.checkExpandable("description", true, this.descEl());
    });
  }

  protected onExpandDescription(elem: HTMLElement): void {
    this.expandService.onExpand(
      "description",
      elem,
      "expanded",
      this.expandService.readFullDescription(),
    );
  }

  protected openPresentation(url: string): void {
    if (url) {
      window.open(url, "_blank");
    }
  }

  protected handleRateButtonClick(): void {
    if (this.ratingCardService.canOpenModal()) {
      this.ratingCardService.showConfirmRateModal.set(true);
    }
  }

  protected confirmRateProject(): void {
    this.ratingCardService.form().markAsTouched();
    if (this.ratingCardService.form().invalid) return;
    this.ratingCardService.confirmRateProject();
  }

  protected redoRating(): void {
    this.ratingCardService.redoRating();
  }

  protected toggleConfirmRateModal(): void {
    this.ratingCardService.showConfirmRateModal.set(!this.ratingCardService.showConfirmRateModal());
  }

  protected closeConfirmRateModal(): void {
    this.ratingCardService.showConfirmRateModal.set(false);
  }
}
