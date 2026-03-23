/** @format */

import { catchError, map, Observable, of, startWith } from "rxjs";
import { Result } from "./result.type";
import { AsyncState, failure, loading, success } from "./async-state";

/**
 * Превращает Observable<Result<T,E>> в Observable<AsyncState<T,E>>
 *
 * Автоматически:
 * - Начинает с loading
 * - ok → success
 * - fail → failure
 * - HTTP-ошибка → failure
 */
export function toAsyncState<T, E = string>(
  previous?: T
): (source: Observable<Result<T, E>>) => Observable<AsyncState<T, E>> {
  return source =>
    source.pipe(
      map(result =>
        result.ok
          ? (success<T>(result.value) as AsyncState<T, E>)
          : (failure<E>(result.error, previous) as AsyncState<T, E>)
      ),
      startWith(loading(previous) as AsyncState<T, E>),
      catchError(err => of(failure(err?.message ?? "Unknown error", previous) as AsyncState<T, E>))
    );
}
