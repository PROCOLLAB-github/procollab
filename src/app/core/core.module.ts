/** @format */

import { ErrorHandler, NgModule } from "@angular/core";
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
import { UserLinksPipe } from "./pipes/user-links.pipe";
import { FormControlPipe } from "./pipes/form-control.pipe";
import { GlobalErrorHandlerService } from "@error/services/global-error-handler.service";
import { ParseBreaksPipe } from "./pipes/parse-breaks.pipe";
import { ParseLinksPipe } from "./pipes/parse-links.pipe";

@NgModule({
  declarations: [
    ControlErrorPipe,
    DayjsPipe,
    UserRolePipe,
    PluralizePipe,
    YearsFromBirthdayPipe,
    UserLinksPipe,
    FormControlPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
  ],
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
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
    ApiService,
  ],
  exports: [
    ControlErrorPipe,
    DayjsPipe,
    UserRolePipe,
    PluralizePipe,
    YearsFromBirthdayPipe,
    UserLinksPipe,
    FormControlPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
  ],
})
export class CoreModule {}
