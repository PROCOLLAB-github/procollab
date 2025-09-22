/** @format */

import { Injectable } from "@angular/core";
import { User } from "@auth/models/user.model";
import { Project } from "@office/models/project.model";
import { BehaviorSubject, filter, map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProfileDataService {
  private profilesSubject = new BehaviorSubject<User | undefined>(undefined);
  private profileIdSubject = new BehaviorSubject<number | undefined>(undefined);
  private profileSubsSubject = new BehaviorSubject<Project[] | undefined>(undefined);

  profile$ = this.profilesSubject.asObservable();
  profileId$ = this.profileIdSubject.asObservable();
  profileSubs$ = this.profileSubsSubject.asObservable();

  setProfile(profile: User) {
    this.profilesSubject.next(profile);
    this.setProfileId(profile.id);
  }

  setProfileId(id: number) {
    this.profileIdSubject.next(id);
  }

  setProfileSubs(subs: Project[]) {
    this.profileSubsSubject.next(subs);
  }

  getProfile() {
    return this.profile$.pipe(
      map(profile => profile),
      filter(profile => !!profile)
    );
  }

  getProfileId() {
    return this.profileId$.pipe(
      map(profileId => profileId),
      filter(profileId => !!profileId)
    );
  }

  getProfileSubs() {
    return this.profileSubs$.pipe(
      map(subs => subs),
      filter(subs => !!subs)
    );
  }
}
