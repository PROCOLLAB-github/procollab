/** @format */

/**
 * Базовый интерфейс доменного события.
 *
 * @example
 * export interface ProjectPublished extends DomainEvent {
 *   readonly type: 'ProjectPublished';
 *   readonly payload: { projectId: number };
 * }
 */
export interface DomainEvent {
  /** Уникальный тип события (используется для маршрутизации) */
  readonly type: string;
  /** Данные события */
  readonly payload: unknown;
  /** Время создания события */
  readonly occurredAt: Date;
}
