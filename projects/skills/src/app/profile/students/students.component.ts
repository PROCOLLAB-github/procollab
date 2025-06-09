/** @format */

import { CommonModule } from "@angular/common";
import { Component, HostListener, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { PluralizePipe } from "@corelib";
import { ButtonComponent, CheckboxComponent } from "@ui/components";
import { AvatarComponent, IconComponent } from "@uilib";
import { Student } from "projects/skills/src/models/trajectory.model";
import { map, Subscription } from "rxjs";
import { TrajectoriesService } from "../../trajectories/trajectories.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LoaderComponent } from "@ui/components/loader/loader.component";

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
    LoaderComponent,
    CheckboxComponent,
  ],
  templateUrl: "./students.component.html",
  styleUrl: "./students.component.scss",
})
export class ProfileStudentsComponent implements OnInit, OnDestroy {
  constructor(private readonly fb: FormBuilder) {
    this.studentForm = this.fb.group({
      initialMeeting: [false, Validators.required],
      finalMeeting: [false, Validators.required],
    });
  }

  route = inject(ActivatedRoute);
  trajectoryService = inject(TrajectoriesService);

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  expanded = false;
  avatarSize = signal(window.innerWidth > 1200 ? 94 : 48);
  expandedStudentId: number | null = null;

  showLoader = signal(true);

  students?: Student[];
  subscriptions: Subscription[] = [];

  studentForm: FormGroup;

  toggleExpand(studentId: number) {
    if (this.expandedStudentId === studentId) {
      this.expandedStudentId = null;
    } else {
      this.expandedStudentId = studentId;

      setTimeout(() => {
        this.showLoader.set(false);
      }, 600);

      const student = this.students?.find(s => s.student.id === studentId);
      if (student) {
        this.studentForm.patchValue({
          initialMeeting: student.initialMeeting,
          finalMeeting: student.finalMeeting,
        });
      }
    }
  }

  onSelect(key: string, value: boolean) {
    if (key === "initialMeeting") {
      this.studentForm.get("initialMeeting")?.setValue(value);
    } else {
      this.studentForm.get("finalMeeting")?.setValue(value);
    }
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

  onSave(id: number) {
    if (this.studentForm.invalid) return;

    const { initialMeeting, finalMeeting } = this.studentForm.value;
    this.trajectoryService.updateMeetings(id, initialMeeting, finalMeeting).subscribe(() => {
      const student = this.students?.find(s => s.meetingId === id);
      if (student) {
        student.initialMeeting = initialMeeting;
        student.finalMeeting = finalMeeting;
      }
      this.expandedStudentId = null;
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.avatarSize.set(event.target.innerWidth > 1200 ? 94 : 48);
  }
}
