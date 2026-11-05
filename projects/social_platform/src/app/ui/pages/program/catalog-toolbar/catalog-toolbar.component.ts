/** @format */

import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { ButtonComponent, IconComponent } from "@uilib";
import { AppRoutes } from "@api/paths/app-routes";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { InteractiveTooltipComponent } from "@ui/primitives/tooltip/interactive-tooltip.component";

@Component({
  selector: "app-program-catalog-toolbar",
  imports: [ButtonComponent, IconComponent, InteractiveTooltipComponent],
  templateUrl: "./catalog-toolbar.component.html",
  styleUrl: "./catalog-toolbar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCatalogToolbarComponent {
  private readonly router = inject(Router);
  protected readonly canCreate = signal<boolean | null>(null);

  constructor() {
    inject(ProgramLaunchUseCase)
      .capabilities()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: capabilities => this.canCreate.set(capabilities.canCreateProgram),
        error: () => {},
      });
  }

  protected createProgram(): void {
    if (this.canCreate() === true) void this.router.navigateByUrl(AppRoutes.program.create());
  }
}
