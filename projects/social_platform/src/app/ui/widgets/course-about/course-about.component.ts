/** @format */

import { AfterViewInit, Component, ElementRef, inject, Input, ViewChild } from "@angular/core";
import { IconComponent } from "@uilib";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { ExpandService } from "@api/expand/expand.service";

/** Виджет «о курсе»: описание курса в модалке/блоке. */
@Component({
  selector: "app-course-about",
  templateUrl: "./course-about.component.html",
  styleUrl: "./course-about.component.scss",
  standalone: true,
  imports: [IconComponent, ParseBreaksPipe, ParseLinksPipe],
  providers: [ExpandService],
})
export class CourseAboutComponent implements AfterViewInit {
  @Input({ required: true }) description!: string;
  @ViewChild("descEl") private descEl?: ElementRef;

  private readonly expandService = inject(ExpandService);

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

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
}
