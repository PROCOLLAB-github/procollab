/** @format */

/**
 * Тип Result для обработки успешных и ошибочных результатов в use cases.
 * Позволяет избежать throw/catch и явно типизировать ошибки.
 *
 * @example
 * // В use case:
 * execute(cmd): Observable<Result<User, LoginError>> {
 *   return repo.login(cmd).pipe(
 *     map(user => ok(user)),
 *     catchError(err => of(fail({ kind: 'wrong_credentials' })))
 *   );
 * }
 *
 * // В presenter:
 * result.match({
 *   ok: user => this.router.navigateByUrl('/office'),
 *   fail: err => this.error.set(err.kind),
 * });
 */

export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Создаёт успешный Result */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Создаёт ошибочный Result */
export function fail<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
