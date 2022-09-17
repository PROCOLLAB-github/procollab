/** @format */

import { APP_INITIALIZER, ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import * as Sentry from "@sentry/angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { Router } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { CoreModule } from "./core/core.module";
import { UiModule } from "./ui/ui.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthModule } from "./auth/auth.module";
import { NgxMaskModule } from "ngx-mask";
import { NgxAutogrowModule } from "ngx-autogrow";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatProgressBarModule } from "@angular/material/progress-bar";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    UiModule,
    AuthModule,
    ReactiveFormsModule,
    NgxAutogrowModule,
    NgxMaskModule.forRoot(),
    BrowserAnimationsModule,
    MatProgressBarModule,
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
