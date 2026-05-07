/**
 * Все возможные состояния асинхронной операции
 *
 * @format
 */

export type AsyncState<T, E = string> =
  | { readonly status: "initial" }
  | { readonly status: "loading"; readonly previous?: T }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "failure"; readonly error: E; readonly previous?: T };

// ── Фабрики (конструкторы состояний) ──

export function initial(): AsyncState<never, never> {
  return { status: "initial" };
}

export function loading<T>(previous?: T): AsyncState<T, never> {
  return { status: "loading", previous };
}

export function success<T>(data: T): AsyncState<T, never> {
  return { status: "success", data };
}

export function failure<E>(error: E, previous?: unknown): AsyncState<never, E> {
  return { status: "failure", error, previous } as any;
}

// ── Type Guards (сужение типов) ──

export function isInitial<T, E>(state: AsyncState<T, E>): state is { status: "initial" } {
  return state.status === "initial";
}

export function isLoading<T, E>(
  state: AsyncState<T, E>
): state is { status: "loading"; previous?: T } {
  return state.status === "loading";
}

export function isSuccess<T, E>(state: AsyncState<T, E>): state is { status: "success"; data: T } {
  return state.status === "success";
}

export function isFailure<T, E>(state: AsyncState<T, E>): state is { status: "failure"; error: E } {
  return state.status === "failure";
}
