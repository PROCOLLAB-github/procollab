/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { CommonModule } from "@angular/common";
import { ProjectRate } from "@office/program/models/project-rate";
import { ParseLinksPipe } from "@core/pipes/parse-links.pipe";
import { ParseBreaksPipe } from "@core/pipes/parse-breaks.pipe";
import { expandElement } from "@utils/expand-element";
import { Observable, fromEvent, map, debounceTime, Subscription, finalize } from "rxjs";
import { BreakpointObserver } from "@angular/cdk/layout";
import { IndustryService } from "@office/services/industry.service";
import { ProjectRatingComponent } from "@office/shared/project-rating/project-rating.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ProjectRatingService } from "@office/shared/project-rating/services/project-rating.service";
import { ControlErrorPipe } from "@core/pipes/control-error.pipe";

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
  ],
})
export class RatingCardComponent implements AfterViewInit, OnDestroy {
  constructor(
    public industryService: IndustryService,
    private projectRatingService: ProjectRatingService,
    private breakpointObserver: BreakpointObserver,
    private cdRef: ChangeDetectorRef
  ) {}

  @Input({ required: true }) project!: ProjectRate;

  @ViewChild("descEl") descEl?: ElementRef;

  ngOnInit(): void {
    this.projectRated = this.project?.isScored;
    this.form.valueChanges.subscribe(console.log);
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;
    this.cdRef.detectChanges();

    const resizeSub$ = fromEvent(window, "resize")
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;
      });

    this.subscriptions$.push(resizeSub$);
  }

  form = new FormControl();

  submitLoading = false;

  readFullDescription = false;

  descriptionExpandable = false;

  projectRated = false;

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  subscriptions$: Subscription[] = [];

  expandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  submitRating(): void {
    this.form.markAsTouched();

    if (this.form.invalid) return;

    const fv = this.form.getRawValue();

    const sumbittedVal = this.projectRatingService.formValuesToDTO(this.project.criterias, fv);

    this.submitLoading = true;

    this.projectRatingService
      .rate(this.project?.id, sumbittedVal)
      .pipe(finalize(() => (this.submitLoading = false)))
      .subscribe(() => (this.projectRated = true));
  }

  redoRating(): void {
    this.projectRated = false;
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach(s => s.unsubscribe());
  }
}
