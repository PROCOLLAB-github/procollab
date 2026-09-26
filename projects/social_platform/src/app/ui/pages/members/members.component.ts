/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  viewChild,
  effect,
  signal,
} from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { containerSm } from "@utils/responsive";
import { CommonModule } from "@angular/common";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { MembersFiltersComponent } from "./members-filters/members-filters.component";
import { MemberCardComponent } from "./member-card/member-card.component";
import { BackComponent } from "@uilib";
import { ButtonComponent } from "@ui/primitives";
import { SoonCardComponent } from "@ui/primitives/soon-card/soon-card.component";
import { MembersInfoService } from "@api/member/facades/members-info.service";
import { MembersUIInfoService } from "@api/member/facades/ui/members-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { MemberFiltersDialogComponent } from "./member-filters-dialog/member-filters-dialog.component";

/** Список участников с поиском, фильтрацией и бесконечной прокруткой. */
@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrl: "./members.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SearchComponent,
    CommonModule,
    MembersFiltersComponent,
    MemberCardComponent,
    BackComponent,
    ButtonComponent,
    SoonCardComponent,
    MemberFiltersDialogComponent,
  ],
  providers: [MembersInfoService, MembersUIInfoService, ProfileDetailUIInfoService],
})
export class MembersComponent implements OnInit, AfterViewInit {
  readonly membersRoot = viewChild<ElementRef<HTMLUListElement> | undefined>("membersRoot"); // Ссылка на корневой элемент списка

  private readonly membersInfoService = inject(MembersInfoService);
  private readonly membersUIInfoService = inject(MembersUIInfoService);

  protected readonly members = this.membersUIInfoService.members;

  // Константы и свойства компонента
  protected readonly searchForm = this.membersUIInfoService.searchForm; // Форма поиска
  protected readonly filterForm = this.membersUIInfoService.filterForm; // Форма фильтрации

  protected readonly containerSm = containerSm; // Брейкпоинт для мобильных устройств
  protected readonly appWidth = window.innerWidth; // Ширина окна браузера
  protected readonly AppRoutes = AppRoutes;
  private readonly breakpoints = inject(BreakpointObserver);
  protected readonly compactLayout = toSignal(
    this.breakpoints.observe("(max-width: 999px)").pipe(map(state => state.matches)),
    { initialValue: this.breakpoints.isMatched("(max-width: 999px)") },
  );
  protected readonly filtersOpen = signal(false);
  protected filtersTrigger: HTMLElement | null = null;

  constructor() {
    // При переходе к desktop фильтры снова видны в sidebar; мобильное окно больше не нужно.
    effect(() => {
      if (!this.compactLayout()) this.filtersOpen.set(false);
    });
  }

  /** Открывает мобильное представление той же формы, не сбрасывая выбранные фильтры. */
  protected openFilters(trigger: HTMLElement): void {
    this.filtersTrigger = trigger;
    this.filtersOpen.set(true);
  }

  ngOnInit(): void {
    this.membersInfoService.initializationMembers();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target && this.membersRoot()) {
      this.membersInfoService.initScroll(target, this.membersRoot()!);
    }
  }

  redirectToProfile(): void {
    this.membersInfoService.redirectToProfile();
  }
}
