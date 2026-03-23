/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { CommonModule } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ButtonComponent } from "@ui/components";
import { SoonCardComponent } from "@ui/shared/soon-card/soon-card.component";
import { CourseModuleCardComponent } from "../../../../components/course-module-card/course-module-card.component";
import { CourseDetailUIInfoService } from "@api/courses/facades/ui/course-detail-ui-info.service";

@Component({
  selector: "app-detail",
  standalone: true,
  imports: [
    IconComponent,
    RouterModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    CommonModule,
    SoonCardComponent,
    ModalComponent,
    ButtonComponent,
    CourseModuleCardComponent,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class TrajectoryInfoComponent implements OnInit, AfterViewInit {
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly courseDetailUIInfoService = inject(CourseDetailUIInfoService);

  protected readonly courseStructure = this.courseDetailUIInfoService.courseStructure;
  protected readonly courseDetail = this.courseDetailUIInfoService.course;
  protected readonly courseModules = this.courseDetailUIInfoService.courseModules;
  protected readonly isCompleteModule = this.courseDetailUIInfoService.isCompleteModule;
  protected readonly isCourseCompleted = this.courseDetailUIInfoService.isCourseCompleted;

  protected descriptionExpandable?: boolean;
  protected readFullDescription!: boolean;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;
    this.cdRef.detectChanges();
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
