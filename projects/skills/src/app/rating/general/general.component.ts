/** @format */

import { Component, inject, type OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TopRatingCardComponent } from "../shared/top-rating-card/top-rating-card.component";
import { BasicRatingCardComponent } from "../shared/basic-rating-card/basic-rating-card.component";
import { ActivatedRoute, Router } from "@angular/router";
import { map, type Observable } from "rxjs";
import type { GeneralRating } from "../../../models/rating.model";
import { SelectComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { FormBuilder, type FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RatingService } from "../services/rating.service";
import { ratingFilters } from "projects/core/src/consts/filters/rating-filter.const";

/**
 * Компонент общего рейтинга пользователей
 *
 * Отображает рейтинг всех пользователей системы с возможностью
 * фильтрации по временным периодам (день, неделя, месяц, год).
 *
 * Функциональность:
 * - Отображение топ-3 пользователей в специальном формате
 * - Список остальных пользователей в стандартном формате
 * - Фильтрация по временным периодам
 * - Автоматическое обновление URL с параметрами фильтра
 */
@Component({
  selector: "app-general",
  standalone: true,
  imports: [
    CommonModule,
    TopRatingCardComponent,
    BasicRatingCardComponent,
    SelectComponent,
    IconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.scss",
})
export class RatingGeneralComponent implements OnInit {
  constructor() {
    // Инициализация формы с фильтром по умолчанию (последний месяц)
    this.ratingForm = this.fb.group({
      filterParam: ["last_month"],
    });
  }

  // Внедрение зависимостей
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ratingService = inject(RatingService);
  private readonly fb = inject(FormBuilder);

  // Поток данных рейтинга из резолвера
  private readonly rating = this.route.data.pipe(map(r => r["data"])) as Observable<
    GeneralRating[]
  >;

  // Сигналы для разделения пользователей на топ-3 и остальных
  top3 = signal<GeneralRating[]>([]);
  rest = signal<GeneralRating[]>([]);

  // Форма для управления фильтрами
  ratingForm: FormGroup;

  // Константы фильтров из конфигурации
  readonly filterParams = ratingFilters;

  /**
   * Инициализация компонента
   *
   * Загружает начальные данные рейтинга и настраивает
   * отслеживание изменений формы фильтрации
   */
  ngOnInit() {
    this.loadInitialRatings();
    this.setupFormValueChanges();
  }

  /**
   * Загрузка начальных данных рейтинга
   *
   * Получает данные из резолвера, разделяет их на топ-3 и остальных,
   * и обновляет URL с текущим параметром фильтра
   */
  loadInitialRatings() {
    this.rating.subscribe(r => {
      this.updateRatingSignals(r);
      this.navigateWithFilterParam(this.ratingForm.get("filterParam")?.value);
    });
  }

  /**
   * Настройка отслеживания изменений формы
   *
   * При изменении фильтра автоматически обновляет URL
   * и загружает новые данные рейтинга
   */
  setupFormValueChanges() {
    this.ratingForm.valueChanges.subscribe(value => {
      this.navigateWithFilterParam(value.filterParam);
      this.loadRatings(value.filterParam);
    });
  }

  /**
   * Обновление URL с параметром фильтра
   *
   * @param filterParam - выбранный временной период фильтрации
   */
  navigateWithFilterParam(filterParam: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filterParam },
    });
  }

  /**
   * Загрузка данных рейтинга с указанным фильтром
   *
   * @param filterParam - временной период для фильтрации рейтинга
   */
  loadRatings(filterParam: "last_month" | "last_year" | "last_day" | "last_week") {
    this.ratingService.getGeneralRating(filterParam).subscribe(r => {
      this.updateRatingSignals(r);
    });
  }

  /**
   * Обновление сигналов с данными рейтинга
   *
   * Разделяет массив пользователей на топ-3 (первые 3 места)
   * и остальных участников рейтинга
   *
   * @param r - массив пользователей рейтинга
   */
  updateRatingSignals(r: GeneralRating[]) {
    this.top3.set(r.slice(0, 3));
    this.rest.set(r.slice(3));
  }
}
