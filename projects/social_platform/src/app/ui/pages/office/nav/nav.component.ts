/** @format */

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppRoutes } from "@api/paths/app-routes";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@ui/primitives";
import { NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { NavService } from "@api/shared/nav.service";

/** Мобильная навигация Office; notification center находится в ProfileControlPanel. */
@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrl: "./nav.component.scss",
  imports: [CommonModule, IconComponent, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly navService = inject(NavService);

  constructor(
    private readonly router: Router,
    private readonly cdref: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) this.mobileMenuOpen = false;
    });

    this.navService.navTitle.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(title => {
      this.title = title;
      this.cdref.detectChanges();
    });
  }

  ngOnDestroy(): void {}

  mobileMenuOpen = false;
  title = "";
  protected readonly AppRoutes = AppRoutes;
}
