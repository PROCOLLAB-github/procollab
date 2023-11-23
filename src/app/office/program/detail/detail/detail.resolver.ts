/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { ProgramService } from "@office/program/services/program.service";
import { Program } from "@office/program/models/program.model";

@Injectable({
  providedIn: "root",
})
export class ProgramDetailResolver  {
  constructor(private readonly programService: ProgramService) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Program> {
    return this.programService.getOne(route.params["programId"]);
  }
}
