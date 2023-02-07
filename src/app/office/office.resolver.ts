/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";

@Injectable({
  providedIn: "root",
})
export class OfficeResolver implements Resolve<Invite[]> {
  constructor(private inviteService: InviteService) {}

  resolve(): Observable<Invite[]> {
    return this.inviteService.getMy();
  }
}
