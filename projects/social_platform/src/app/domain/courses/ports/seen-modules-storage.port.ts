/** @format */

/**
 * Хранилище "просмотренных" завершённых модулей курса.
 * Позволяет показать поздравление ровно один раз на модуль.
 * Контракт синхронный — текущие реализации синхронны.
 */
export abstract class SeenModulesStoragePort {
  abstract isSeen(courseId: number, moduleId: number): boolean;
  abstract markSeen(courseId: number, moduleId: number): void;
}
