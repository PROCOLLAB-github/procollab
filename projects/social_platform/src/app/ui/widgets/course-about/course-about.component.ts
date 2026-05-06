/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from "@angular/core";
import { IconComponent } from "@uilib";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { expandElement } from "@utils/expand-element";

@Component({
  selector: "app-course-about",
  templateUrl: "./course-about.component.html",
  styleUrl: "./course-about.component.scss",
  standalone: true,
  imports: [IconComponent, ParseBreaksPipe, ParseLinksPipe],
})
export class CourseAboutComponent implements AfterViewInit {
  @Input({ required: true }) description!: string;
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly cdRef = inject(ChangeDetectorRef);

  descriptionExpandable = false;
  readFullDescription = false;

  ngAfterViewInit(): void {
    const el = this.descEl?.nativeElement;
    this.descriptionExpandable = el?.clientHeight < el?.scrollHeight;
    this.cdRef.detectChanges();
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
