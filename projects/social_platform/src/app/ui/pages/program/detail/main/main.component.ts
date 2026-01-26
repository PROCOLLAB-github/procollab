/** @format */
import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { SoonCardComponent } from "@ui/shared/soon-card/soon-card.component";
import { NewsFormComponent } from "@ui/components/news-form/news-form.component";
import { NewsCardComponent } from "@ui/components/news-card/news-card.component";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "projects/core/src/lib/pipes/user/user-links.pipe";
import { ProjectAdditionalService } from "projects/social_platform/src/app/api/project/project-additional.service";
import { FeedNews } from "projects/social_platform/src/app/domain/project/project-news.model";
import { ProgramDetailMainUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProgramDetailMainService } from "projects/social_platform/src/app/api/program/facades/detail/program-detail-main-info.service";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";
import { NewsInfoService } from "projects/social_platform/src/app/api/news/news-info.service";

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
  ],
  providers: [ProgramDetailMainService, ProgramDetailMainUIInfoService],
  standalone: true,
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

  protected readonly isAssignProjectToProgramError =
    this.projectAdditionalService.getIsAssignProjectToProgramError();

  protected readonly errorAssignProjectToProgramModalMessage =
    this.projectAdditionalService.errorAssignProjectToProgramModalMessage;

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

  protected readonly program = this.programDetailMainUIInfoService.program;
  protected readonly news = this.newsInfoService.news;

  protected readonly showProgramModal = this.programDetailMainUIInfoService.showProgramModal;
  protected readonly showProgramModalErrorMessage =
    this.programDetailMainUIInfoService.showProgramModalErrorMessage;

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
    this.programDetailMainService.onAddNews(news).subscribe({
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
    this.programDetailMainService.onEdit(news, newsId).subscribe({
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
