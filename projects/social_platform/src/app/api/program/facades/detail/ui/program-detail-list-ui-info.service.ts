/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { ProjectRate } from "projects/social_platform/src/app/domain/project/project-rate";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

@Injectable()
export class ProgramDetailListUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly listType = signal<"projects" | "members" | "rating">("projects");

  readonly listTotalCount = signal<number>(0);
  readonly listPage = signal<number>(0);
  readonly listTake = signal<number>(20);
  readonly perPage = signal<number>(21);

  readonly list = signal<any[]>([]);
  readonly searchedList = signal<any[]>([]);

  readonly profileSubscriptions = signal<Project[]>([]);
  readonly profileProjSubsIds = computed(() => this.profileSubscriptions().map(sub => sub.id));

  itemsPerPage = computed(() => {
    return this.listType() === "rating"
      ? 10
      : this.listType() === "projects"
      ? this.perPage()
      : this.listTake();
  });

  searchParamName = computed(() => {
    return this.listType() === "rating" ? "name__contains" : "search";
  });

  readonly searchForm = this.fb.group({
    search: [""],
  });

  routerLink(linkId: number): string {
    switch (this.listType()) {
      case "projects":
        return `/office/projects/${linkId}`;

      case "members":
        return `/office/profile/${linkId}`;

      default:
        return "";
    }
  }

  applyInitializationSearchForm(value: string): void {
    this.searchForm.setValue({ search: value });
  }

  applyInitializationProgramListData(data: any): void {
    this.list.set(data.results);
    this.searchedList.set(data.results);
    this.listTotalCount.set(data.count);
  }

  applySetupProfile(subs: ApiPagination<Project>): void {
    this.profileSubscriptions.set(subs.results);
  }

  applyFetchProgramData(
    data: ApiPagination<Project> | ApiPagination<User> | ApiPagination<ProjectRate>
  ): void {
    this.listTotalCount.set(data.count);

    if (this.listPage() === 0) {
      this.list.set(data.results);
    } else {
      const newResults = data.results.filter(
        newItem => !this.list().some(existingItem => existingItem.id === newItem.id)
      );
      this.list.update(() => [...this.list(), ...newResults]);
    }

    this.searchedList.set(this.list());
  }
}
