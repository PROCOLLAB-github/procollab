/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { BearerTokenInterceptor } from "./interceptors/bearer-token.interceptor";
import { ApiService } from "./services";
import { CamelcaseInterceptor } from "./interceptors/camelcase.interceptor";
import { ControlErrorPipe } from "./pipes/control-error.pipe";
import { DayjsPipe } from "./pipes/dayjs.pipe";
import { UserRolePipe } from "./pipes/user-role.pipe";
import { PluralizePipe } from "./pipes/pluralize.pipe";
import { YearsFromBirthdayPipe } from "./pipes/years-from-birthday.pipe";

@NgModule({
  declarations: [ControlErrorPipe, DayjsPipe, UserRolePipe, PluralizePipe, YearsFromBirthdayPipe],
  imports: [CommonModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CamelcaseInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BearerTokenInterceptor,
      multi: true,
    },
    ApiService,
  ],
  exports: [ControlErrorPipe, DayjsPipe, UserRolePipe, PluralizePipe, YearsFromBirthdayPipe],
})
export class CoreModule {}
