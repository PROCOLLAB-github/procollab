/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { AuthService } from "@auth/services";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { ButtonComponent, IconComponent, InputComponent, SelectComponent } from "@ui/components";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { concatMap, first, map, noop, Observable, skip, Subscription } from "rxjs";
import { Router } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import { NavService } from "@services/nav.service";
import { EditorSubmitButtonDirective } from "@ui/directives/editor-submit-button.directive";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AsyncPipe } from "@angular/common";
import { Specialization } from "@office/models/specialization";
import { SpecializationsService } from "@office/services/specializations.service";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { SpecializationsGroupComponent } from "@office/shared/specializations-group/specializations-group.component";
import { SkillsBasketComponent } from "@office/shared/skills-basket/skills-basket.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { Skill } from "@office/models/skill";
import { SkillsService } from "@office/services/skills.service";

dayjs.extend(cpf);

@Component({
  selector: "app-profile-edit",
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    TagComponent,
    IconComponent,
    ButtonComponent,
    AvatarControlComponent,
    TextareaComponent,
    EditorSubmitButtonDirective,
    AsyncPipe,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SkillsBasketComponent,
    SkillsGroupComponent,
    SpecializationsGroupComponent,
    ModalComponent,
  ],
})
export class ProfileEditComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private readonly cdref: ChangeDetectorRef,
    public readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly specsService: SpecializationsService,
    private readonly skillsService: SkillsService,
    private readonly router: Router,
    private readonly navService: NavService,
  ) {
    this.profileForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: [""],
      userType: [0],
      birthday: ["", [Validators.required]],
      city: [""],
      links: this.fb.array([]),
      organization: [""],
      speciality: ["", [Validators.required]],
      skills: [[], [Validators.required]],
      achievements: this.fb.array([]),
      avatar: [""],
      aboutMe: [""],
      typeSpecific: this.fb.group({}),
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Редактирование профиля");

    const userType$ = this.profileForm
      .get("userType")
      ?.valueChanges.pipe(skip(1), concatMap(this.changeUserType.bind(this)))
      .subscribe(noop);

    userType$ && this.subscription$.push(userType$);

    const userAvatar$ = this.profileForm
      .get("avatar")
      ?.valueChanges.pipe(
        skip(1),
        concatMap(url => this.authService.saveAvatar(url)),
      )
      .subscribe(noop);

    userAvatar$ && this.subscription$.push(userAvatar$);
  }

  ngAfterViewInit() {
    const profile$ = this.authService.profile.pipe(first()).subscribe(profile => {
      this.profileId = profile.id;

      this.profileForm.patchValue({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: profile.email ?? "",
        status: profile.userType ?? "",
        userType: profile.userType ?? 1,
        birthday: profile.birthday ? dayjs(profile.birthday).format("DD.MM.YYYY") : "",
        city: profile.city ?? "",
        organization: profile.organization ?? "",
        speciality: profile.speciality ?? "",
        skills: profile.skills ?? [],
        avatar: profile.avatar ?? "",
        aboutMe: profile.aboutMe ?? "",
      });

      this.cdref.detectChanges();

      profile.achievements.length &&
        profile.achievements?.forEach(achievement =>
          this.addAchievement(achievement.id, achievement.title, achievement.status),
        );

      profile.links.length && profile.links.forEach(l => this.addLink(l));

      if ([2, 3, 4].includes(profile.userType)) {
        this.typeSpecific?.addControl("preferredIndustries", this.fb.array([]));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        profile[this.userTypeMap[profile.userType]].preferredIndustries.forEach(
          (industry: string) => this.addPreferredIndustry(industry),
        );

        this.cdref.detectChanges();
      }

      if ([1, 3, 4].includes(profile.userType)) {
        const userTypeData = profile.member ?? profile.mentor ?? profile.expert;
        this.typeSpecific.addControl("usefulToProject", this.fb.control(""));
        this.typeSpecific.get("usefulToProject")?.patchValue(userTypeData?.usefulToProject);
        this.cdref.detectChanges();
      }

      this.cdref.detectChanges();
    });
    profile$ && this.subscription$.push(profile$);
  }

  ngOnDestroy(): void {
    this.subscription$.forEach($ => $.unsubscribe());
  }

  profileId?: number;

  inlineSpecs = signal<Specialization[]>([]);

  nestedSpecs$ = this.specsService.getSpecializationsNested();

  specsGroupsModalOpen = signal(false);

  inlineSkills = signal<Skill[]>([]);

  nestedSkills$ = this.skillsService.getSkillsNested();

  skillsGroupsModalOpen = signal(false);

  subscription$: Subscription[] = [];

  get typeSpecific(): FormGroup {
    return this.profileForm.get("typeSpecific") as FormGroup;
  }

  get usefulToProject(): FormControl {
    return this.typeSpecific.get("usefulToProject") as FormControl;
  }

  get preferredIndustries(): FormArray {
    return this.typeSpecific.get("preferredIndustries") as FormArray;
  }

  newPreferredIndustryTitle = "";

  addPreferredIndustry(title?: string): void {
    const fromState = title ?? this.newPreferredIndustryTitle;
    if (!fromState) {
      return;
    }

    const control = this.fb.control(fromState, [Validators.required]);
    this.preferredIndustries.push(control);

    this.newPreferredIndustryTitle = "";
  }

  removePreferredIndustry(i: number): void {
    this.preferredIndustries.removeAt(i);
  }

  get achievements(): FormArray {
    return this.profileForm.get("achievements") as FormArray;
  }

  errorMessage = ErrorMessage;

  roles: Observable<SelectComponent["options"]> = this.authService.changeableRoles.pipe(
    map(roles => roles.map(role => ({ id: role.id, value: role.id, label: role.name }))),
  );

  profileFormSubmitting = false;
  profileForm: FormGroup;

  addAchievement(id?: number, title?: string, status?: string): void {
    this.achievements.push(
      this.fb.group({
        title: [title ?? "", [Validators.required]],
        status: [status ?? "", [Validators.required]],
        id: [id],
      }),
    );
  }

  removeAchievement(i: number): void {
    this.achievements.removeAt(i);
  }

  get links(): FormArray {
    return this.profileForm.get("links") as FormArray;
  }

  newLink = "";

  addLink(title?: string): void {
    const fromState = title ?? this.newLink;

    const control = this.fb.control(fromState, [Validators.required]);
    this.links.push(control);

    this.newLink = "";
  }

  removeLink(i: number): void {
    this.links.removeAt(i);
  }

  private userTypeMap: { [type: number]: string } = {
    1: "member",
    2: "mentor",
    3: "expert",
    4: "investor",
  };

  saveProfile(): void {
    if (!this.validationService.getFormValidation(this.profileForm) || this.profileFormSubmitting) {
      return;
    }

    this.profileFormSubmitting = true;

    const newProfile = {
      ...this.profileForm.value,
      [this.userTypeMap[this.profileForm.value.userType]]: this.typeSpecific.value,
      typeSpecific: undefined,
      birthday: this.profileForm.value.birthday
        ? dayjs(this.profileForm.value.birthday, "DD.MM.YYYY").format("YYYY-MM-DD")
        : undefined,
      skillsIds: this.profileForm.value.skills.map((s: Skill) => s.id),
    };

    this.authService
      .saveProfile(newProfile)
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

  onSelectSpec(speciality: Specialization): void {
    this.profileForm.patchValue({ speciality: speciality.name });
  }

  onSearchSpec(query: string): void {
    this.specsService.getSpecializationsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSpecs.set(results);
    });
  }

  toggleSpecsGroupsModal(): void {
    this.specsGroupsModalOpen.update(open => !open);
  }

  onToggleSkill(toggledSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  onAddSkill(newSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    this.profileForm.patchValue({ skills: [newSkill, ...skills] });
  }

  onRemoveSkill(oddSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    this.profileForm.patchValue({ skills: skills.filter(skill => skill.id !== oddSkill.id) });
  }

  onSearchSkill(query: string): void {
    this.skillsService.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSkills.set(results);
    });
  }

  toggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }
}
