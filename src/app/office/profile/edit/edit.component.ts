/** @format */

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../../../auth/services";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "../../../error/models/error-message";
import { SelectComponent } from "../../../ui/components";
import { ValidationService } from "../../../core/services";
import { concatMap, first, map, noop, Observable, Subscription, take } from "rxjs";
import { Router } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";

dayjs.extend(cpf);

@Component({
  selector: "app-profile-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class ProfileEditComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private cdref: ChangeDetectorRef,
    public authService: AuthService,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: [""],
      userType: [0],
      birthday: ["", [Validators.required]],
      city: [""],
      organization: [""],
      speciality: [""],
      keySkills: this.fb.array([]),
      achievements: this.fb.array([]),
      avatar: [""],
      aboutMe: [""],
    });
  }

  ngOnInit(): void {
    this.profileForm
      .get("userType")
      ?.valueChanges.pipe(take(1), concatMap(this.changeUserType.bind(this)))
      .subscribe(noop);
  }

  ngAfterViewInit(): void {
    this.profile$ = this.authService.profile.pipe(first()).subscribe(profile => {
      this.profileId = profile.id;

      this.profileForm.patchValue({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: profile.email ?? "",
        status: profile.userType ?? "",
        birthday: profile.birthday ? dayjs(profile.birthday).format("DD.MM.YYYY") : "",
        city: profile.city ?? "",
        organization: profile.organization ?? "",
        speciality: profile.speciality ?? "",
        avatar: profile.avatar ?? "",
        aboutMe: profile.aboutMe ?? "",
      });

      profile.achievements.length &&
        profile.achievements?.forEach(achievement =>
          this.addAchievement(achievement.id, achievement.title, achievement.status)
        );

      if (profile.userType === 2) {
        this.profileForm.addControl(
          "mentor",
          this.fb.group({
            preferredIndustries: this.fb.array([]),
          })
        );
      }

      profile.keySkills?.forEach(skill => this.addKeySkill(skill));

      this.cdref.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.profile$?.unsubscribe();
  }

  profileId?: number;

  profile$?: Subscription;

  get achievements(): FormArray {
    return this.profileForm.get("achievements") as FormArray;
  }

  errorMessage = ErrorMessage;

  roles: Observable<SelectComponent["options"]> = this.authService.roles.pipe(
    map(roles => roles.map(role => ({ id: role.id, value: role.id, label: role.name })))
  );

  profileFormSubmitting = false;
  profileForm: FormGroup;

  addAchievement(id?: number, title?: string, status?: string): void {
    this.achievements.push(
      this.fb.group({
        title: [title ?? "", [Validators.required]],
        status: [status ?? "", [Validators.required]],
        id: [id],
      })
    );
  }

  removeAchievement(i: number): void {
    this.achievements.removeAt(i);
  }

  get keySkills(): FormArray {
    return this.profileForm.get("keySkills") as FormArray;
  }

  newKeySkillTitle = "";

  addKeySkill(title?: string): void {
    const fromState = title ?? this.newKeySkillTitle;
    if (!fromState) {
      return;
    }

    const control = this.fb.control(fromState, [Validators.required]);
    this.keySkills.push(control);

    this.newKeySkillTitle = "";
  }

  removeKeySkill(i: number): void {
    this.keySkills.removeAt(i);
  }

  saveProfile(): void {
    if (!this.validationService.getFormValidation(this.profileForm) || this.profileFormSubmitting) {
      return;
    }

    this.profileFormSubmitting = true;

    this.authService
      .saveProfile({
        ...this.profileForm.value,
        birthday: this.profileForm.value.birthday
          ? dayjs(this.profileForm.value.birthday, "DD.MM.YYYY").format("YYYY-MM-DD")
          : undefined,
      })
      .pipe(concatMap(() => this.authService.getProfile()))
      .subscribe({
        next: () => {
          this.profileFormSubmitting = false;
          this.router
            .navigateByUrl(`/office/profile/${this.profileId}`)
            .then(() => console.debug("Router Changed form ProfileEditComponent"));
        },
        error: () => {
          this.profileFormSubmitting = false;
        },
      });
  }

  changeUserType(typeId: number): Observable<void> {
    return this.authService
      .saveProfile({
        email: this.profileForm.value.email,
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        userType: typeId,
      })
      .pipe(map(() => location.reload()));
  }
}
