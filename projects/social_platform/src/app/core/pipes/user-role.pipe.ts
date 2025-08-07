/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import { AuthService } from "@auth/services";
import { map, Observable } from "rxjs";

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
  constructor(private readonly authService: AuthService) {}

  /**
   * Преобразует числовой ID роли в название роли
   *
   * @param value - ID роли (число)
   * @returns Observable<string | undefined> - Observable с названием роли или undefined, если роль не найдена
   */
  transform(value: number): Observable<string | undefined> {
    return this.authService.roles.pipe(map(roles => roles.find(role => role.id === value)?.name));
  }
}
