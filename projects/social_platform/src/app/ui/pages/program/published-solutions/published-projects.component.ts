/** @format */
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, switchMap, tap } from "rxjs";
import { GetPublishedProgramProjectsUseCase } from "@api/program/use-cases/get-published-projects.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { PaginationComponent, StateComponent } from "@uilib";
import { ProgramListComponent } from "../detail/list/list.component";

@Component({
  selector: "app-published-program-projects",
  imports: [
    ReactiveFormsModule,
    SearchComponent,
    InfoCardComponent,
    PaginationComponent,
    StateComponent,
  ],
  template: ` <section class="public-projects" aria-label="Проекты-участники">
    <app-search [formControl]="search" placeholder="Поиск по названию проекта" />
    @if (loading()) {
      <app-state kind="loading" title="Загружаем проекты…" />
    } @else if (error()) {
      <app-state kind="error" title="Публичные проекты пока недоступны." />
    } @else if (data(); as page) {
      <ul class="public-projects__list">
        @for (project of page.results; track project.id) {
          <li><app-info-card type="projects" [profileId]="project.id" [info]="project" /></li>
        } @empty {
          <li><app-state title="Опубликованные проекты не найдены." /></li>
        }
      </ul>
      @if (page.count) {
        <app-pagination
          [previousDisabled]="offset() === 0"
          [nextDisabled]="offset() + 20 >= page.count"
          (previous)="changePage(-1)"
          (next)="changePage(1)"
        >
          {{ offset() + 1 }}–{{ offset() + page.results.length }} из {{ page.count }}
        </app-pagination>
      }
    }
  </section>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .public-projects {
      padding-block: 12px 40px;
    }
    .public-projects__list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
      gap: 30px 20px;
      margin-block: 30px;
      list-style: none;
      padding: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishedProgramProjectsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly read = inject(GetPublishedProgramProjectsUseCase);
  private readonly program = inject(ProgramDetailMainUIInfoService).program;
  readonly search = new FormControl("", { nonNullable: true });
  readonly offset = signal(0);
  readonly data = signal<ApiPagination<Project> | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(
        search =>
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { search: search.trim() || null, offset: null },
          }),
      );
    this.route.queryParamMap
      .pipe(
        tap(query => {
          this.search.setValue(query.get("search") ?? "", { emitEvent: false });
          const offset = Number(query.get("offset"));
          this.offset.set(Number.isSafeInteger(offset) && offset >= 0 ? offset : 0);
          this.loading.set(true);
          this.error.set(false);
        }),
        switchMap(() => this.read.execute(this.program()!.id, this.search.value, this.offset())),
        takeUntilDestroyed(),
      )
      .subscribe(result => {
        this.loading.set(false);
        if (result.ok) this.data.set(result.value);
        else {
          this.data.set(null);
          this.error.set(true);
        }
      });
  }
  changePage(direction: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { offset: Math.max(0, this.offset() + 20 * direction) || null },
      queryParamsHandling: "merge",
    });
  }
}

@Component({
  selector: "app-program-projects-page",
  imports: [ProgramListComponent, PublishedProgramProjectsComponent],
  template: `@if (program()?.isUserManager) {
      <app-list />
    } @else {
      <app-published-program-projects />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramProjectsPageComponent {
  readonly program = inject(ProgramDetailMainUIInfoService).program;
}
