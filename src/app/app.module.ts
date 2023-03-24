/** @format */

import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthModule } from "@auth/auth.module";
import { NgxMaskModule } from "ngx-mask";
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
    NgxMaskModule.forRoot(),
    BrowserAnimationsModule,
    MatProgressBarModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
