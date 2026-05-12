/** @format */

import { Observable } from "rxjs";

export interface UnifiedOption<T = unknown> {
  id: T;
  label: string;
  value?: T;
}

export interface FilterFieldConfig<TValue = unknown, TData = unknown> {
  /** Название поля в query параметрах */
  queryParam: string;
  /** Тип поля */
  type: "checkbox" | "radio" | "select" | "range" | "switch" | "autocomplete" | "slider";
  /** Заголовок поля */
  title: string;
  /** Значение по умолчанию */
  defaultValue?: TValue;
  /** Опции для select/radio */
  options?: UnifiedOption<TValue>[];
  /** Источник данных (Observable) */
  dataSource?: Observable<TData[]>;
  /** Поле для отображения из источника данных */
  displayField?: string;
  /** Поле значения из источника данных */
  valueField?: keyof TData;
  /** Дополнительные параметры для конкретного типа */
  config?: unknown;
}

export interface FilterConfig<TValue = unknown, TData = unknown> {
  /** Конфигурация полей фильтра */
  fields: FilterFieldConfig<TValue, TData>[];
  /** Параметры для сброса при clearFilters */
  clearParams?: string[];
  /** Заголовок фильтра */
  title?: string;
  /** Показывать ли кнопку "Сбросить фильтры" */
  showClearButton?: boolean;
}
