/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { ProjectRate } from "@domain/project/project-rate";
import { Project } from "@domain/project/project.model";
import { AsyncState, initial, isLoading, isSuccess } from "@domain/shared/async-state";

@Injectable()
export class ProgramDetailListUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly listType = signal<"projects" | "members" | "rating">("projects");

  readonly listTotalCount = signal<number>(0);
  readonly listPage = signal<number>(0);
  readonly listTake = signal<number>(20);
  readonly perPage = signal<number>(21);

  readonly list$ = signal<AsyncState<any[]>>(initial());
  readonly loadingMore = signal(false);
  readonly searchedList = signal<any[]>([]);

  readonly list = computed(() => {
    const state = this.list$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  readonly profileSubscriptions = signal<Project[]>([]);
  readonly profileProjSubsIds = computed(() => this.profileSubscriptions().map(sub => sub.id));

  readonly availableFilters = signal<PartnerProgramFields[]>([]);

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

  readonly isHintExpertsModal = signal<boolean>(false);

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

  applySetAvailableFilters(filters: PartnerProgramFields[]): void {
    this.availableFilters.set(filters);
  }

  applySetupProfile(subs: ApiPagination<Project>): void {
    this.profileSubscriptions.set(subs.results);
  }

  applyHintModalOpen(): void {
    this.isHintExpertsModal.set(true);
  }
}
