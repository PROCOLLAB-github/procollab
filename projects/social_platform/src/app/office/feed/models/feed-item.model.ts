/** @format */

import { FeedNews } from "@office/projects/models/project-news.model";
import { Vacancy } from "@models/vacancy.model";
import { Program } from "@office/program/models/program.model";

/**
 * МОДЕЛИ ДАННЫХ ДЛЯ ЭЛЕМЕНТОВ ЛЕНТЫ
 *
 * Этот файл содержит TypeScript интерфейсы и типы для элементов ленты новостей.
 * Определяет структуру данных для проектов, вакансий и новостей.
 *
 * ОСНОВНЫЕ ТИПЫ:
 * - FeedProject: данные проекта в ленте
 * - FeedItemType: возможные типы элементов ленты
 * - FeedItem: объединенный тип для всех элементов ленты
 */
/**
 * ИНТЕРФЕЙС ПРОЕКТА В ЛЕНТЕ
 *
 * Описывает структуру данных проекта, отображаемого в ленте новостей
 *
 * ПОЛЯ:
 * @property id - уникальный идентификатор проекта
 * @property name - название проекта
 * @property shortDescription - краткое описание проекта
 * @property industry - ID отрасли проекта
 * @property imageAddress - URL изображения проекта
 * @property viewsCount - количество просмотров проекта
 * @property leader - ID руководителя проекта
 */
export interface FeedProject {
  id: number;
  name: string;
  shortDescription: string;
  industry: number;
  imageAddress: string;
  viewsCount: number;
  leader: number;
  partnerProgram: {
    id: Program["id"];
    name: Program["name"];
  } | null;
}

/**
 * ТИП ЭЛЕМЕНТА ЛЕНТЫ
 *
 * Определяет возможные типы контента в ленте:
 * - "vacancy": вакансия
 * - "news": новость
 * - "project": проект
 */
export type FeedItemType = "vacancy" | "news" | "project";

/**
 * ОБЪЕДИНЕННЫЙ ТИП ЭЛЕМЕНТА ЛЕНТЫ
 *
 * Дискриминированное объединение типов для всех возможных элементов ленты.
 * Каждый элемент имеет поле typeModel для определения типа и соответствующий content.
 *
 * ВАРИАНТЫ:
 * - Проект: typeModel = "project", content = FeedProject
 * - Вакансия: typeModel = "vacancy", content = Vacancy
 * - Новость: typeModel = "news", content = FeedNews с дополнительным contentObject
 */
export type FeedItem =
  | ({ typeModel: FeedItemType } & {
      typeModel: "project";
      content: FeedProject;
    })
  | { typeModel: "vacancy"; content: Vacancy }
  | { typeModel: "news"; content: FeedNews & { contentObject: { id: number } } };
