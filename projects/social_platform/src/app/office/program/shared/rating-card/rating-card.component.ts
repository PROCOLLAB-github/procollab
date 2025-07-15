/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  signal,
  ViewChild,
} from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { CommonModule } from "@angular/common";
import { ProjectRate } from "@office/program/models/project-rate";
import { ControlErrorPipe, ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { expandElement } from "@utils/expand-element";
import { debounceTime, finalize, fromEvent, map, Observable, Subscription } from "rxjs";
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

  @Input({ required: true }) set project(proj: ProjectRate | null) {
    if (!proj) return;
    this._project.set(proj);
    this.projectRated.set(proj.isScored);
  }

  get project(): ProjectRate | null {
    return this._project();
  }

  @Input({ required: true }) set projects(proj: ProjectRate[] | null) {
    if (!proj) return;
    this._projects.set(proj);
  }

  get projects(): ProjectRate[] | null {
    return this._projects();
  }

  @Input({ required: true }) set currentIndex(curIndx: number) {
    if (!curIndx) return;
    this._currentIndex.set(curIndx);
  }

  get currentIndex(): number {
    return this._currentIndex();
  }

  @Output() onNext: EventEmitter<void> = new EventEmitter();
  @Output() onPrev: EventEmitter<void> = new EventEmitter();

  @ViewChild("descEl") descEl?: ElementRef;

  _project = signal<ProjectRate | null>(null);
  _currentIndex = signal<number>(0);
  _projects = signal<ProjectRate[]>([]);

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

  toggleRate(type: "next" | "prev"): void {
    if (type === "next") {
      this.onNext.emit();
    } else {
      this.onPrev.emit();
    }
  }
}
