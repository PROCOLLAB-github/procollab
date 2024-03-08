/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  signal,
} from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { CommonModule } from "@angular/common";
import { ProjectRate } from "@office/program/models/project-rate";
import { ParseLinksPipe, ParseBreaksPipe, ControlErrorPipe } from "projects/core";
import { expandElement } from "@utils/expand-element";
import { Observable, fromEvent, map, debounceTime, Subscription, finalize } from "rxjs";
import { BreakpointObserver } from "@angular/cdk/layout";
import { IndustryService } from "@office/services/industry.service";
import { ProjectRatingComponent } from "@office/shared/project-rating/project-rating.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ProjectRatingService } from "@office/program/services/project-rating.service";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-rating-card",
  templateUrl: "./rating-card.component.html",
  styleUrl: "./rating-card.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    AvatarComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    ProjectRatingComponent,
    ControlErrorPipe,
    RouterLink,
  ],
})
export class RatingCardComponent implements AfterViewInit, OnDestroy {
  constructor(
    public industryService: IndustryService,
    private projectRatingService: ProjectRatingService,
    private breakpointObserver: BreakpointObserver,
    private cdRef: ChangeDetectorRef
  ) {}

  @Input({ required: true }) set project(proj: ProjectRate) {
    if (!proj) return;
    this._project.set(proj);
    this.projectRated.set(proj.isScored);
  }

  get project(): ProjectRate | null {
    return this._project();
  }

  @ViewChild("descEl") descEl?: ElementRef;

  _project = signal<ProjectRate | null>(null);

  form = new FormControl();

  submitLoading = signal(false);

  readFullDescription = signal(false);

  descriptionExpandable = signal(false);

  projectRated = signal(false);

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  subscriptions$ = signal<Subscription[]>([]);

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable.set(descElement?.clientHeight < descElement?.scrollHeight);
    this.cdRef.detectChanges();

    const resizeSub$ = fromEvent(window, "resize")
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.descriptionExpandable.set(descElement?.clientHeight < descElement?.scrollHeight);
      });

    this.subscriptions$().push(resizeSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  expandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription.set(!isExpanded);
  }

  submitRating(): void {
    this.form.markAsTouched();

    if (this.form.invalid) return;

    const fv = this.form.getRawValue();

    const project = this.project as ProjectRate;

    const sumbittedVal = this.projectRatingService.formValuesToDTO(project.criterias, fv);

    this.submitLoading.set(true);

    this.projectRatingService
      .rate(project.id, sumbittedVal)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe(() => this.projectRated.set(true));
  }

  redoRating(): void {
    this.projectRated.set(false);
  }
}
