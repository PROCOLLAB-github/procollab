/** @format */

/**
 * Базовый интерфейс доменного события.
 * Доменные события описывают что произошло в системе (прошедшее время).
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
