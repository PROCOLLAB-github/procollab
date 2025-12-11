/** @format */

import { Observable } from "rxjs";

export interface UnifiedOption {
  id: string | number;
  label: string;
  value?: any;
}

export interface FilterFieldConfig {
  /** Название поля в query параметрах */
  queryParam: string;
  /** Тип поля */
  type: "checkbox" | "radio" | "select" | "range" | "switch" | "autocomplete" | "slider";
  /** Заголовок поля */
  title: string;
  /** Значение по умолчанию */
  defaultValue?: any;
  /** Опции для select/radio */
  options?: Array<{ id: any; label: string; value?: any }>;
  /** Источник данных (Observable) */
  dataSource?: Observable<any[]>;
  /** Поле для отображения из источника данных */
  displayField?: string;
  /** Поле значения из источника данных */
  valueField?: string;
  /** Дополнительные параметры для конкретного типа */
  config?: any;
}

export interface FilterConfig {
  /** Конфигурация полей фильтра */
  fields: FilterFieldConfig[];
  /** Параметры для сброса при clearFilters */
  clearParams?: string[];
  /** Заголовок фильтра */
  title?: string;
  /** Показывать ли кнопку "Сбросить фильтры" */
  showClearButton?: boolean;
}
