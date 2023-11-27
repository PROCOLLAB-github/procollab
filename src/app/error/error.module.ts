/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ErrorComponent } from "./error.component";
import { ErrorCodeComponent } from "./code/error-code.component";
import { ErrorNotFoundComponent } from "./not-found/error-not-found.component";

@NgModule({
  imports: [CommonModule, ErrorComponent, ErrorCodeComponent, ErrorNotFoundComponent],
})
export class ErrorModule {}
