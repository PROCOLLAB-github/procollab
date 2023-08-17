/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { MembersResult } from "@auth/models/user.model";
import { ProgramService } from "@office/program/services/program.service";

@Injectable({
  providedIn: "root",
})
export class ProgramMembersResolver implements Resolve<MembersResult> {
  constructor(private readonly programService: ProgramService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<MembersResult> {
    return this.programService.getAllMembers(route.parent?.params["programId"], 0, 3);
  }
}
