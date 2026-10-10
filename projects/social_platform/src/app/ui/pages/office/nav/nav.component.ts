/** @format */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  NavigationStart,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { A11yModule } from "@angular/cdk/a11y";
import { Overlay } from "@angular/cdk/overlay";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ButtonDirective, DrawerDirective } from "@uilib";
import { IconComponent } from "@ui/primitives";
import { NavService } from "@api/shared/nav.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Мобильная навигация; backend-уведомления остаются в production ProfileControlPanel. */
@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrl: "./nav.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    RouterLink,
    RouterLinkActive,
    A11yModule,
    ButtonDirective,
    DrawerDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly navService = inject(NavService);
  private readonly menuScrollStrategy = inject(Overlay).scrollStrategies.block();
  private menuTrigger?: HTMLElement;
  readonly logout = output<void>();
  mobileMenuOpen = false;
  title = "";
  protected readonly AppRoutes = AppRoutes;
  constructor(
    private readonly router: Router,
    private readonly cdref: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.title = this.routeTitle(this.router.url);
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.closeMenu();
        this.cdref.markForCheck();
      }
      if (event instanceof NavigationEnd) {
        this.title = this.routeTitle(event.urlAfterRedirects) || this.title;
        this.cdref.markForCheck();
      }
    });
    this.navService.navTitle.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(title => {
      this.title = this.routeTitle(this.router.url) || title;
      this.cdref.markForCheck();
    });
  }
  private routeTitle(url: string): string {
    const path = url.split(/[?#]/)[0];
    if (/^\/office\/profile\/edit(?:\/|$)/.test(path)) return "Редактирование профиля";
    if (/^\/office\/projects\/create(?:\/|$)/.test(path)) return "Создание проекта";
    if (/^\/office\/projects\/\d+\/edit(?:\/|$)/.test(path)) return "Редактирование проекта";
    if (/^\/office\/projects\/\d+(?:\/|$)/.test(path)) return "Профиль проекта";
    const sections: Record<string, string> = {
      feed: "Новости",
      projects: "Проекты",
      members: "Участники",
      program: "Программы",
      courses: "Курсы",
      vacancies: "Вакансии",
      profile: "Профиль",
    };
    return sections[path.split("/")[2]] || "";
  }
  @HostListener("window:resize") onResize(): void {
    if (window.innerWidth >= 1000) this.closeMenu();
  }
  toggleMenu(event: MouseEvent): void {
    if (this.mobileMenuOpen) {
      this.closeMenu();
      return;
    }
    this.menuTrigger = event.currentTarget as HTMLElement;
    this.mobileMenuOpen = true;
    this.menuScrollStrategy.enable();
  }
  closeMenu(): void {
    this.mobileMenuOpen = false;
    this.menuScrollStrategy.disable();
    this.menuTrigger?.focus();
  }
  ngOnDestroy(): void {
    this.menuScrollStrategy.disable();
  }
}
