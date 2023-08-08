/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { ProgramService } from "@office/program/services/program.service";
import { ProgramDataSchema } from "@office/program/models/program.model";

@Injectable({
  providedIn: "root",
})
export class ProgramRegisterResolver implements Resolve<ProgramDataSchema> {
  constructor(private readonly programService: ProgramService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ProgramDataSchema> {
    return this.programService.getDataSchema(route.params["programId"]);
  }
}
