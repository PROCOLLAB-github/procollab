/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { BackComponent, IconComponent } from "@uilib";
import { BarComponent, ButtonComponent, SelectComponent } from "@ui/components";
import { SearchComponent } from "@ui/components/search/search.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { CheckboxComponent } from "../../../../ui/components/checkbox/checkbox.component";
import { filterTags } from "projects/core/src/consts/filter-tags";

@Component({
  selector: "app-rate-projects",
  templateUrl: "./rate-projects.component.html",
  styleUrl: "./rate-projects.component.scss",
  standalone: true,
  imports: [BarComponent, RouterOutlet, ReactiveFormsModule],
})
export class RateProjectsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder
  ) {
    // const isRatedByExpert =
    //   this.route.snapshot.queryParams["is_rated_by_expert"] === "true"
    //     ? true
    //     : this.route.snapshot.queryParams["is_rated_by_expert"] === "false"
    //     ? false
    //     : null;

    const searchValue = this.route.snapshot.queryParams["name__contains"];
    const decodedSearchValue = searchValue ? decodeURIComponent(searchValue) : "";

    this.searchForm = this.fb.group({
      search: [decodedSearchValue],
    });

    // this.filterForm = this.fb.group({
    //   filterTag: [isRatedByExpert, Validators.required],
    // });
  }

  searchForm: FormGroup;
  // filterForm: FormGroup;

  subscriptions$: Subscription[] = [];
  programId?: number;

  isOpen = false;
  // readonly filterTags = filterTags;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");
    this.programId = this.route.snapshot.params["programId"];

    const queryParams$ = this.route.queryParams.subscribe(params => {
      const searchValue = params["name__contains"];
      this.searchForm.get("search")?.setValue(searchValue, { emitEvent: false });
    });

    this.subscriptions$.push(queryParams$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  // setValue(event: Event, tag: boolean | null) {
  //   event.stopPropagation();
  //   this.filterForm.get("filterTag")?.setValue(tag);
  //   this.isOpen = false;

  //   this.router.navigate([], {
  //     queryParams: { is_rated_by_expert: tag },
  //     relativeTo: this.route,
  //     queryParamsHandling: "merge",
  //   });
  // }

  // toggleOpen(event: Event) {
  //   event.stopPropagation();
  //   this.isOpen = !this.isOpen;
  // }

  onClickOutside() {
    this.isOpen = false;
  }

  onSearchClick() {
    const searchValue = this.searchForm.get("search")?.value;

    this.router.navigate([], {
      queryParams: { name__contains: searchValue },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });

    this.searchForm.get("search")?.reset();
  }
}
