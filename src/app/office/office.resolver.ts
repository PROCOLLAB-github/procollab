/** @format */

import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";

@Injectable({
  providedIn: "root",
})
export class OfficeResolver  {
  constructor(private readonly inviteService: InviteService) {}

  resolve(): Observable<Invite[]> {
    return this.inviteService.getMy();
  }
}
