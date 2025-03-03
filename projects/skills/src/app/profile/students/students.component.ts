/** @format */

import { AsyncPipe, CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterModule, RouterOutlet } from "@angular/router";
import { PluralizePipe } from "@corelib";
import { ButtonComponent, CheckboxComponent } from "@ui/components";
import { AvatarComponent, IconComponent } from "@uilib";
import { Student } from "projects/skills/src/models/trajectory.model";
import { map, Subscription } from "rxjs";

@Component({
  selector: "app-students",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PluralizePipe,
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    CheckboxComponent,
  ],
  templateUrl: "./students.component.html",
  styleUrl: "./students.component.scss",
})
export class ProfileStudentsComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  expanded = false;
  avatarSize = signal(window.innerWidth > 1200 ? 94 : 48);
  expandedStudentId: number | null = null;

  students?: Student[];
  subscriptions: Subscription[] = [];

  toggleExpand(studentId: number) {
    this.expandedStudentId = this.expandedStudentId === studentId ? null : studentId;
  }

  ngOnInit(): void {
    const students = this.route.data.pipe(map(r => r["students"])).subscribe((r: Student[]) => {
      this.students = r;
    });

    this.subscriptions.push(students);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.avatarSize.set(event.target.innerWidth > 1200 ? 94 : 48);
  }
}
