/** @format */

import { Injectable, signal } from "@angular/core";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";

@Injectable()
export class MentorsUIInfoService {
  readonly mentorsTake = signal<number>(20);
  readonly mentorsTotalCount = signal<number | undefined>(undefined);
  readonly members = signal<User[]>([]);

  applyMentorsPagination(data: ApiPagination<User>): void {
    this.mentorsTotalCount.set(data.count);
    this.members.set(data.results);
  }

  applyMentorsChunk(data: ApiPagination<User>): void {
    this.members.update(list => [...list, ...(data.results || [])]);
    this.mentorsTotalCount.set(data.count);
  }
}
