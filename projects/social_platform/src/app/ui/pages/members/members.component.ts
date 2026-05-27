/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { containerSm } from "@utils/responsive";
import { CommonModule } from "@angular/common";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { MembersFiltersComponent } from "./members-filters/members-filters.component";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import { BackComponent } from "@uilib";
import { ButtonComponent } from "@ui/primitives";
import { SoonCardComponent } from "@ui/primitives/soon-card/soon-card.component";
import { MembersInfoService } from "@api/member/facades/members-info.service";
import { MembersUIInfoService } from "@api/member/facades/ui/members-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";

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
    RouterLink,
    MembersFiltersComponent,
    InfoCardComponent,
    BackComponent,
    ButtonComponent,
    SoonCardComponent,
  ],
  providers: [MembersInfoService, MembersUIInfoService, ProfileDetailUIInfoService],
  standalone: true,
})
export class MembersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("membersRoot") membersRoot?: ElementRef<HTMLUListElement>; // Ссылка на корневой элемент списка
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>; // Ссылка на элемент фильтра

  private readonly membersInfoService = inject(MembersInfoService);
  private readonly membersUIInfoService = inject(MembersUIInfoService);

  protected readonly members = this.membersUIInfoService.members;

  // Константы и свойства компонента
  protected readonly searchForm = this.membersUIInfoService.searchForm; // Форма поиска
  protected readonly filterForm = this.membersUIInfoService.filterForm; // Форма фильтрации

  protected readonly containerSm = containerSm; // Брейкпоинт для мобильных устройств
  protected readonly appWidth = window.innerWidth; // Ширина окна браузера
  protected readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    this.membersInfoService.initializationMembers();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target && this.membersRoot) {
      this.membersInfoService.initScroll(target, this.membersRoot);
    }
  }

  ngOnDestroy(): void {
    this.membersInfoService.destroy();
  }

  redirectToProfile(): void {
    this.membersInfoService.redirectToProfile();
  }
}
