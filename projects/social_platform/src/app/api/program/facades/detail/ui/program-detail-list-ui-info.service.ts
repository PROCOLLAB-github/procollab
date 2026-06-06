/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { AsyncState, initial, isLoading, isSuccess } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import Fuse from "fuse.js";

/** Состояние интерфейса списков программы: проекты, участники, рейтинг, фильтры и пагинация. */
@Injectable()
export class ProgramDetailListUIInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly profileInfoService = inject(ProfileInfoService);

  readonly listType = signal<"projects" | "members" | "rating">("projects");

  readonly listTotalCount = signal<number>(0);
  readonly listPage = signal<number>(0);
  readonly listTake = signal<number>(20);
  readonly perPage = signal<number>(21);

  readonly list$ = signal<AsyncState<any[]>>(initial());
  readonly loadingMore = signal(false);
  readonly searchQuery = signal<string>("");

  readonly list = computed(() => {
    const state = this.list$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  readonly searchedList = computed<any[]>(() => {
    const list = this.list();
    const search = this.searchQuery().trim();
    if (!search) return list;

    const keys = this.listType() === "members" ? ["firstName", "lastName"] : ["name"];
    return new Fuse(list, { keys }).search(search).map(r => r.item);
  });

  readonly profileProjSubsIds = computed(() =>
    this.profileInfoService.profileSubs().map(sub => sub.id),
  );

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
        return AppRoutes.projects.detail(linkId);

      case "members":
        return AppRoutes.profile.detail(linkId);

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

  applyHintModalOpen(): void {
    this.isHintExpertsModal.set(true);
  }
}
