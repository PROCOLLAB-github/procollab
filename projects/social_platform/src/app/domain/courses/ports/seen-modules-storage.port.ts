/** @format */

/**
 * Порт для хранилища "просмотренных" завершённых модулей курса.
 *
 * Нужен, чтобы показать пользователю поздравление ровно один раз
 * на модуль — после того как модуль перешёл в `completed`.
 *
 * Реализуется любым хранилищем (localStorage, IndexedDB, backend).
 * Контракт синхронный, так как текущие реализации in-memory/storage синхронны;
 * миграция на async — отдельное архитектурное решение.
 */
export abstract class SeenModulesStoragePort {
  abstract isSeen(courseId: number, moduleId: number): boolean;
  abstract markSeen(courseId: number, moduleId: number): void;
}
