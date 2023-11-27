/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ErrorComponent } from "./error.component";
import { ErrorRoutingModule } from "./error-routing.module";
import { ErrorCodeComponent } from "./code/error-code.component";
import { ErrorNotFoundComponent } from "./not-found/error-not-found.component";

@NgModule({
    imports: [CommonModule, ErrorRoutingModule, ErrorComponent, ErrorCodeComponent, ErrorNotFoundComponent],
})
export class ErrorModule {}
