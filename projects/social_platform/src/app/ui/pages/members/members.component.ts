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
import { SearchComponent } from "@ui/components/search/search.component";
import { MembersFiltersComponent } from "../../components/members-filters/members-filters.component";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { BackComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { SoonCardComponent } from "@ui/shared/soon-card/soon-card.component";
import { MembersInfoService } from "../../../api/member/facades/members-info.service";
import { MembersUIInfoService } from "../../../api/member/facades/ui/members-ui-info.service";

/**
 * Компонент для отображения списка участников с возможностью поиска и фильтрации
 *
 * Основные функции:
 * - Отображение списка участников в виде карточек
 * - Поиск участников по имени
 * - Фильтрация по навыкам, специальности, возрасту и принадлежности к МосПолитеху
 * - Бесконечная прокрутка для подгрузки дополнительных участников
 * - Синхронизация фильтров с URL параметрами
 *
 * @component MembersComponent
 */
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
  providers: [MembersInfoService, MembersUIInfoService],
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

  /**
   * Инициализация компонента
   *
   * Выполняет:
   * - Очистку URL параметров
   * - Установку заголовка навигации
   * - Загрузку начальных данных из резолвера
   * - Настройку подписок на изменения форм и URL параметров
   */
  ngOnInit(): void {
    this.membersInfoService.initializationMembers();
  }

  /**
   * Инициализация после создания представления
   *
   * Настраивает обработчик события прокрутки для реализации бесконечной прокрутки
   */
  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target && this.membersRoot) {
      this.membersInfoService.initScroll(target, this.membersRoot);
    }
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.membersInfoService.destroy();
  }

  redirectToProfile(): void {
    this.membersInfoService.redirectToProfile();
  }
}
