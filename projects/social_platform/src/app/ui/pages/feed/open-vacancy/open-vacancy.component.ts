/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/primitives";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { TruncatePipe, DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ExpandService } from "@api/expand/expand.service";

/** Карточка вакансии в ленте с поддержкой разворачивания контента. */
@Component({
  selector: "app-open-vacancy",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    RouterLink,
    TagComponent,
    DayjsPipe,
    ParseLinksPipe,
    ParseBreaksPipe,
    TruncatePipe,
    AvatarComponent,
  ],
  templateUrl: "./open-vacancy.component.html",
  styleUrl: "./open-vacancy.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExpandService],
})
export class OpenVacancyComponent implements AfterViewInit {
  @Input() feedItem!: Vacancy;

  private readonly expandService = inject(ExpandService);
  protected readonly AppRoutes = AppRoutes;
  private readonly industryRepository = inject(IndustryRepositoryPort);

  @ViewChild("skillsEl") private skillsEl?: ElementRef;
  @ViewChild("descEl") private descEl?: ElementRef;

  readFullSkills = false;

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;
  protected readonly industryRepositoryGetOne = (id: number) => this.industryRepository.getOne(id);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.expandService.checkExpandable("description", true, this.descEl);
    });
  }

  protected onExpandDescription(elem: HTMLElement): void {
    this.expandService.onExpand(
      "description",
      elem,
      "expanded",
      this.expandService.readFullDescription()
    );
  }

  protected toggleSkills(): void {
    this.readFullSkills = !this.readFullSkills;
  }
}
