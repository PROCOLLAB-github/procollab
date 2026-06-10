/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { map, Observable, shareReplay } from "rxjs";

/**
 * Пайп для преобразования ID роли пользователя в название роли
 * Используется в шаблонах Angular для отображения названия роли вместо её ID
 *
 * Пример использования в шаблоне: {{ userId | userRole | async }}
 */
@Pipe({
  name: "userRole",
  standalone: true,
})
export class UserRolePipe implements PipeTransform {
  private readonly roles$ = this.authRepository.fetchUserRoles().pipe(shareReplay(1));

  constructor(private readonly authRepository: AuthRepositoryPort) {}

  /**
   * Преобразует числовой ID роли в название роли
   *
   * @param value - ID роли (число)
   * @returns Observable<string | undefined> - Observable с названием роли или undefined, если роль не найдена
   */
  transform(value: number): Observable<string | undefined> {
    return this.roles$.pipe(map(roles => roles.find(role => role.id === value)?.name));
  }
}
