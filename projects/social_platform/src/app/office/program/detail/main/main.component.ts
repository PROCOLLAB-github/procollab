/** @format */
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  concatMap,
  fromEvent,
  map,
  noop,
  Observable,
  of,
  Subscription,
  tap,
  throttleTime,
} from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramNewsService } from "@office/program/services/program-news.service";
import { FeedNews } from "@office/projects/models/project-news.model";
import { expandElement } from "@utils/expand-element";
import { ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { ProgramNewsCardComponent } from "../shared/news-card/news-card.component";
import { ButtonComponent, IconComponent, InputComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ApiPagination } from "@models/api-pagination.model";
import { TagComponent } from "@ui/components/tag/tag.component";
import { NewsFormComponent } from "@office/shared/news-form/news-form.component";
import { ProjectService } from "@office/services/project.service";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { AsyncPipe } from "@angular/common";
import { LoadingService } from "@office/services/loading.service";
import { Project } from "@office/models/project.model";
import { HttpErrorResponse } from "@angular/common/http";
import { ProjectAssign } from "@office/projects/models/project-assign.model";
import { ProjectAdditionalService } from "@office/projects/edit/services/project-additional.service";
import { SoonCardComponent } from "@office/shared/soon-card/soon-card.component";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  imports: [
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    RouterLink,
    ProgramNewsCardComponent,
    TagComponent,
    UserLinksPipe,
    AsyncPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    NewsFormComponent,
    ModalComponent,
    MatProgressBarModule,
    InputComponent,
    SoonCardComponent,
  ],
})
export class ProgramDetailMainComponent implements OnInit, OnDestroy {
  constructor(
    private readonly programService: ProgramService,
    private readonly programNewsService: ProgramNewsService,
    private readonly projectService: ProjectService,
    private readonly projectAdditionalService: ProjectAdditionalService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdRef: ChangeDetectorRef,
    private readonly loadingService: LoadingService
  ) {}

  get isAssignProjectToProgramError() {
    return this.projectAdditionalService.getIsAssignProjectToProgramError()();
  }

  get errorAssignProjectToProgramModalMessage() {
    return this.projectAdditionalService.getErrorAssignProjectToProgramModalMessage();
  }

  news = signal<FeedNews[]>([]);
  totalNewsCount = signal(0);
  fetchLimit = signal(10);
  fetchPage = signal(0);

  // Сигналы для работы с модальными окнами с текстом
  showProgramModal = signal(false);
  showProgramModalErrorMessage = signal<string | null>(null);
  assignProjectToProgramModalMessage = signal<ProjectAssign | null>(null);

  // Сигналы для управления состоянием
  showSubmitProjectModal = signal(false);
  isAssignProjectToProgramModalOpen = signal(false);

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  clearAssignProjectToProgramError(): void {
    this.projectAdditionalService.clearAssignProjectToProgramError();
  }

  selectedProjectId = 0;
  dubplicatedProjectId = 0;

  programId?: number;

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const programIdSubscription$ = this.route.params
      .pipe(
        map(params => params["programId"]),
        tap(programId => {
          this.programId = programId;
          this.fetchNews(0, this.fetchLimit());
        })
      )
      .subscribe();

    const routeModalSub$ = this.route.queryParams.subscribe(param => {
      if (param["access"] === "accessDenied") {
        this.loadingService.hide();

        this.showProgramModal.set(true);
        this.showProgramModalErrorMessage.set("У вас не доступа к этой вкладке!");

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { access: null },
          queryParamsHandling: "merge",
          replaceUrl: true,
        });
      }
    });

    const program$ = this.route.data
      .pipe(
        map(r => r["data"]),
        tap(program => {
          this.program = program;
          this.registerDateExpired = Date.now() > Date.parse(program.datetimeRegistrationEnds);
        }),
        concatMap(program => {
          if (program.isUserMember) {
            return this.fetchNews(0, this.fetchLimit());
          } else {
            return of({} as ApiPagination<FeedNews>);
          }
        })
      )
      .subscribe({
        next: news => {
          if (news.results?.length) {
            this.news.set(news.results);
            this.totalNewsCount.set(news.count);
          }

          this.loadingService.hide();
        },
        error: () => {
          this.loadingService.hide();

          this.showProgramModal.set(true);
          this.showProgramModalErrorMessage.set("Произошла ошибка при загрузке программы");
        },
      });

    const memeberProjects$ = this.projectService.getMy().subscribe({
      next: projects => {
        this.memberProjects = projects.results.filter(project => !project.draft);
      },
    });

    this.subscriptions$().push(program$);
    this.subscriptions$().push(memeberProjects$);
    this.subscriptions$().push(programIdSubscription$);
    this.subscriptions$().push(routeModalSub$);
  }

  ngAfterViewInit() {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;
    this.cdRef.detectChanges();
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(2000)
        )
        .subscribe();
      this.subscriptions$().push(scrollEvents$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  onScroll() {
    if (this.news().length < this.totalNewsCount()) {
      return this.fetchNews(this.fetchPage() * this.fetchLimit(), this.fetchLimit()).pipe(
        tap(({ results }) => {
          this.news.update(news => [...news, ...results]);
          if (results.length < this.fetchLimit()) {
            // console.log('No more to fetch')
          } else {
            this.fetchPage.update(p => p + 1);
          }
        })
      );
    }

    const target = document.querySelector(".office__body");
    if (!target) return of({});
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (scrollBottom > 0) return of({});
    this.fetchPage.update(p => p + 1);
    return this.fetchNews(this.fetchPage() * this.fetchLimit(), this.fetchLimit());
  }

  fetchNews(offset: number, limit: number) {
    const programId = this.route.snapshot.params["programId"];
    return this.programNewsService.fetchNews(limit, offset, programId).pipe(
      tap(({ count, results }) => {
        this.totalNewsCount.set(count);
        this.news.update(news => [...news, ...results]);
      })
    );
  }

  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild("descEl") descEl?: ElementRef;

  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });
    this.programNewsService.readNews(this.route.snapshot.params["programId"], ids).subscribe(noop);
  }

  onAddNews(news: { text: string; files: string[] }): void {
    this.programNewsService
      .addNews(this.route.snapshot.params["programId"], news)
      .subscribe(newsRes => {
        this.newsFormComponent?.onResetForm();
        this.news.update(news => [newsRes, ...news]);
      });
  }

  onDelete(newsId: number) {
    const item = this.news().find((n: any) => n.id === newsId);
    if (!item) return;
    this.programNewsService.deleteNews(this.route.snapshot.params["programId"], newsId).subscribe({
      next: () => {
        const index = this.news().findIndex(news => news.id === newsId);
        this.news().splice(index, 1);
      },
    });
  }

  onLike(newsId: number) {
    const item = this.news().find((n: any) => n.id === newsId);
    if (!item) return;
    this.programNewsService
      .toggleLike(this.route.snapshot.params["programId"], newsId, !item.isUserLiked)
      .subscribe(() => {
        item.likesCount = item.isUserLiked ? item.likesCount - 1 : item.likesCount + 1;
        item.isUserLiked = !item.isUserLiked;
      });
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  closeModal(): void {
    this.showProgramModal.set(false);
    this.loadingService.hide();
  }

  /**
   * Переключатель для модалки выбора проекта
   */
  toggleSubmitProjectModal(): void {
    this.showSubmitProjectModal.set(!this.showSubmitProjectModal());

    if (!this.showSubmitProjectModal()) {
      this.selectedProjectId = 0;
    }
  }

  /**
   * Обработчик изменения радио-кнопки для выбора проекта
   */
  onProjectRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedProjectId = +target.value;

    if (this.selectedProjectId) {
      this.memberProjects.find(project => project.id === this.selectedProjectId);
    }
  }

  /**
   * Добавление проекта на программу
   */
  addProjectModal(): void {
    if (!this.selectedProjectId) {
      return;
    }

    const selectedProject = this.memberProjects.find(
      project => project.id === this.selectedProjectId
    );

    this.assignProjectToProgram(selectedProject!);
  }

  /** Эмитим логику для привязки проекта к программе */
  /**
   * Привязка проекта к программе выбранной
   * Перенаправление её на редактирование "нового" проекта
   */
  assignProjectToProgram(project: Project): void {
    if (this.programId) {
      this.projectService.assignProjectToProgram(project.id, this.programId).subscribe({
        next: r => {
          this.dubplicatedProjectId = r.newProjectId;
          this.assignProjectToProgramModalMessage.set(r);
          this.isAssignProjectToProgramModalOpen.set(true);
          this.toggleSubmitProjectModal();
          this.selectedProjectId = 0;
        },

        error: err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.setAssignProjectToProgramError(err.error);
            }
          }
        },
      });
    }
  }

  closeAssignProjectToProgramModal(): void {
    this.isAssignProjectToProgramModalOpen.set(false);
    this.router.navigateByUrl(
      `/office/projects/${this.dubplicatedProjectId}/edit?editingStep=main`
    );
  }

  onOpenDetailProgram(): void {
    if (!this.program?.isUserMember && !this.program?.isUserManager) return;

    this.showDetails = true;
  }

  program?: Program;
  memberProjects: Project[] = [];
  registerDateExpired!: boolean;
  descriptionExpandable!: boolean;
  readFullDescription = false;
  showDetails = false;
}
