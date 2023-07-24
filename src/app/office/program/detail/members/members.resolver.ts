/** @format */

import { Injectable } from "@angular/core";
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { User } from "@auth/models/user.model";
import { ProgramService } from "@office/program/services/program.service";

@Injectable({
  providedIn: "root",
})
export class ProgramMembersResolver implements Resolve<User[]> {
  constructor(private readonly programService: ProgramService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User[]> {
    return this.programService.getAllMembers(route.parent?.params["programId"]);
  }
}
