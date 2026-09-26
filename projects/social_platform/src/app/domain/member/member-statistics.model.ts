/**
 * Глобальные счётчики активных участников, независимые от выдачи каталога.
 *
 * @format
 */

export interface MemberStatistics {
  readonly total: number;
  readonly inProjects: number;
  readonly inPrograms: number;
  readonly newLast30Days: number;
}
