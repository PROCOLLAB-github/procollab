/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import { AuthService } from "../../auth/services";
import { map, Observable } from "rxjs";

@Pipe({
  name: "userRole",
})
export class UserRolePipe implements PipeTransform {
  constructor(private authService: AuthService) {}

  transform(value: number): Observable<string | undefined> {
    return this.authService.roles.pipe(map(roles => roles.find(role => role.id === value)?.name));
  }
}
