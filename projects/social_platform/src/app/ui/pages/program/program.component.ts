/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter, startWith } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/primitives/search/search.component";
import {
  BackComponent,
  ButtonDirective,
  FormLayoutDirective,
  IconComponent,
  PageHeaderComponent,
} from "@uilib";
import { AppRoutes } from "@api/paths/app-routes";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramInfoService } from "@api/program/facades/program-info.service";
import { ProgramMainUIInfoService } from "@api/program/facades/ui/program-main-ui-info.service";

/** Контейнер модуля программ с поиском и навигацией. */
@Component({
  selector: "app-program",
  templateUrl: "./program.component.html",
  styleUrl: "./program.component.scss",
  imports: [
    PageHeaderComponent,
    FormLayoutDirective,
    ReactiveFormsModule,
    SearchComponent,
    RouterOutlet,
    BackComponent,
    RouterLink,
    RouterLinkActive,
    ButtonDirective,
    IconComponent,
  ],
  providers: [ProgramInfoService, ProgramMainUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramComponent implements OnInit {
  private readonly launch = inject(ProgramLaunchUseCase);
  private readonly destroy = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly paths = AppRoutes;
  readonly canCreate = signal(false);
  readonly isManaged = signal(false);
  private readonly programInfoService = inject(ProgramInfoService);
  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);

  protected readonly searchForm = this.programMainUIInfoService.searchForm;

  ngOnInit(): void {
    this.programInfoService.initializationPrograms();
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe(() => this.isManaged.set(this.router.url.split("?")[0].endsWith("/managed")));
    this.launch
      .capabilities()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: value => this.canCreate.set(value.canCreateProgram),
        error: () => {},
      });
  }
}
