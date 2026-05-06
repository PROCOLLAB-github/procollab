/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { isFailure } from "@domain/shared/async-state";
import { RouterModule } from "@angular/router";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { SoonCardComponent } from "@ui/primitives/soon-card/soon-card.component";
import { NewsFormComponent } from "@ui/widgets/news-form/news-form.component";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "@core/lib/pipes/user/user-links.pipe";
import { FeedNews } from "@domain/project/project-news.model";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProgramDetailMainService } from "@api/program/facades/detail/program-detail-main-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { NewsInfoService } from "@api/news/news-info.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProgramLinksComponent } from "@ui/widgets/program-links/program-links.component";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [
    IconComponent,
    ButtonComponent,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    ModalComponent,
    MatProgressBarModule,
    SoonCardComponent,
    NewsFormComponent,
    ModalComponent,
    MatProgressBarModule,
    TruncatePipe,
    RouterModule,
    NewsCardComponent,
    ProgramLinksComponent,
  ],
  providers: [ProgramDetailMainService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramDetailMainComponent implements OnInit, OnDestroy {
  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) ProgramNewsCardComponent?: NewsCardComponent;
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  private readonly programDetailMainService = inject(ProgramDetailMainService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);
  private readonly newsInfoService = inject(NewsInfoService);
  private readonly expandService = inject(ExpandService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isAssignProjectToProgramError = computed(() =>
    isFailure(this.projectAdditionalService.isSend$())
  );

  protected readonly errorAssignProjectToProgramModalMessage =
    this.projectAdditionalService.errorAssignProjectToProgramModalMessage;

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

  protected readonly program = this.programDetailMainUIInfoService.program;
  protected readonly news = this.newsInfoService.news;

  protected readonly showProgramModal = this.programDetailMainUIInfoService.showProgramModal;
  protected readonly showProgramModalErrorMessage =
    this.programDetailMainUIInfoService.showProgramModalErrorMessage;

  protected readonly registeredProgramModal =
    this.programDetailMainUIInfoService.registeredProgramModal;

  ngOnInit(): void {
    this.programDetailMainService.initializationProgramDetailMain(this.descEl);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body") as HTMLElement;

    if (target || this.descEl) {
      this.programDetailMainService.initScroll(target, this.descEl);
    }
  }

  ngOnDestroy(): void {
    this.programDetailMainService.destroy();
  }

  onAddNews(news: { text: string; files: string[] }): void {
    this.programDetailMainService
      .onAddNews(news)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.newsFormComponent?.onResetForm(),
      });
  }

  onDelete(newsId: number) {
    this.programDetailMainService.onDelete(newsId);
  }

  onLike(newsId: number) {
    this.programDetailMainService.onLike(newsId);
  }

  onEdit(news: FeedNews, newsId: number) {
    this.programDetailMainService
      .onEdit(news, newsId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.ProgramNewsCardComponent?.onCloseEditMode(),
      });
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    this.expandService.onExpand("description", elem, expandedClass, isExpanded);
  }

  closeModal(): void {
    this.programDetailMainService.closeModal();
  }

  clearAssignProjectToProgramError(): void {
    this.projectAdditionalService.clearAssignProjectToProgramError();
  }
}
