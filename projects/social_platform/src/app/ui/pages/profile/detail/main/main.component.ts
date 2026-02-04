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
import { CommonModule } from "@angular/common";
import { ProfileDetailInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/profile-detail-info.service";
import { ProfileDetailUIInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProfileLeftSideComponent } from "./components/profile-left-side/profile-left-side.component";
import { ProfileRightSideComponent } from "./components/profile-right-side/profile-right-side.component";
import { ProfileMidSideComponent } from "./components/profile-mid-side/profile-mid-side.component";

/**
 * Главный компонент страницы профиля пользователя
 *
 * Отображает основную информацию профиля пользователя, включая:
 * - Раздел "Обо мне" с описанием и навыками пользователя
 * - Ленту новостей пользователя с возможностью добавления, редактирования и удаления
 * - Боковую панель с информацией о проектах, образовании, работе, достижениях и контактах
 * - Систему подтверждения навыков другими пользователями
 * - Модальные окна для детального просмотра подтверждений навыков
 *
 * Функциональность:
 * - Управление новостями (CRUD операции)
 * - Система лайков для новостей
 * - Отслеживание просмотров новостей через Intersection Observer
 * - Подтверждение/отмена подтверждения навыков пользователя
 * - Раскрывающиеся списки для длинных списков (проекты, достижения и т.д.)
 * - Адаптивное отображение контента
 *
 * @implements OnInit - для инициализации и загрузки новостей
 * @implements AfterViewInit - для работы с DOM элементами
 * @implements OnDestroy - для очистки подписок и observers
 */
@Component({
  selector: "app-profile-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [
    CommonModule,
    ProfileLeftSideComponent,
    ProfileRightSideComponent,
    ProfileMidSideComponent,
  ],
  providers: [ProfileDetailInfoService, ProfileDetailUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProfileMainComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly profileDetailInfoService = inject(ProfileDetailInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);

  protected readonly user = this.profileDetailUIInfoService.user;

  /**
   * Инициализация компонента
   * Загружает новости пользователя и настраивает Intersection Observer для отслеживания просмотров
   */
  ngOnInit(): void {
    this.profileDetailInfoService.initializationProfile();
  }

  /**
   * Инициализация после создания представления
   * Проверяет необходимость отображения кнопки "Читать полностью" для описания профиля
   */
  ngAfterViewInit(): void {
    this.profileDetailInfoService.initCheckDescription(this.descEl);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок
   */
  ngOnDestroy(): void {
    this.profileDetailInfoService.destroy();
  }
}
