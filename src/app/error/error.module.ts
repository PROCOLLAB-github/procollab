/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ErrorComponent } from "./error.component";
import { ErrorRoutingModule } from "./error-routing.module";
import { ErrorCodeComponent } from "./code/error-code.component";
import { ErrorNotFoundComponent } from "./not-found/error-not-found.component";

@NgModule({
  declarations: [ErrorComponent, ErrorCodeComponent, ErrorNotFoundComponent],
  imports: [CommonModule, ErrorRoutingModule],
})
export class ErrorModule {}
