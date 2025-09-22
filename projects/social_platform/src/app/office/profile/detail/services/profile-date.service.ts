/** @format */

import { Injectable } from "@angular/core";
import { User } from "@auth/models/user.model";
import { BehaviorSubject, filter, map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProfileDataService {
  private profilesSubject = new BehaviorSubject<User | undefined>(undefined);
  profile$ = this.profilesSubject.asObservable();

  setProfile(profile: User) {
    this.profilesSubject.next(profile);
  }

  getProfile() {
    return this.profile$.pipe(
      map(profile => profile),
      filter(profile => !!profile)
    );
  }
}
