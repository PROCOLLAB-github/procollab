/** @format */

import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  inject,
  type OnDestroy,
  type OnInit,
  signal,
} from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { PluralizePipe } from "@corelib";
import { ButtonComponent, CheckboxComponent } from "@ui/components";
import { AvatarComponent, IconComponent } from "@uilib";
import { Student } from "projects/skills/src/models/trajectory.model";
import { map, Subscription } from "rxjs";
import { TrajectoriesService } from "../../trajectories/trajectories.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LoaderComponent } from "@ui/components/loader/loader.component";

/**
 * Компонент управления студентами для менторов
 *
 * Предоставляет интерфейс для менторов по управлению своими студентами:
 * - Просмотр списка закрепленных студентов
 * - Отметка о проведении начальных и финальных встреч
 * - Адаптивное отображение для разных размеров экрана
 * - Расширяемые карточки студентов с формой управления
 *
 * Компонент доступен только пользователям со статусом ментора
 * и отображает студентов, назначенных конкретному ментору.
 */
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
    // Инициализация формы для управления встречами
    this.studentForm = this.fb.group({
      initialMeeting: [false, Validators.required],
      finalMeeting: [false, Validators.required],
    });
  }

  // Внедрение зависимостей
  route = inject(ActivatedRoute);
  trajectoryService = inject(TrajectoriesService);

  // URL заглушки для аватаров без изображения
  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  // Состояние UI
  expanded = false;
  avatarSize = signal(window.innerWidth > 1200 ? 94 : 48);
  expandedStudentId: number | null = null;
  showLoader = signal(true);

  // Данные студентов
  students?: Student[];
  subscriptions: Subscription[] = [];

  // Форма для управления встречами
  studentForm: FormGroup;

  /**
   * Переключение развернутого состояния карточки студента
   *
   * @param studentId - идентификатор студента
   *
   * Если карточка уже развернута - сворачивает её,
   * иначе разворачивает и загружает данные студента в форму
   */
  toggleExpand(studentId: number) {
    if (this.expandedStudentId === studentId) {
      this.expandedStudentId = null;
    } else {
      this.expandedStudentId = studentId;

      // Имитация загрузки данных
      setTimeout(() => {
        this.showLoader.set(false);
      }, 600);

      // Заполнение формы данными выбранного студента
      const student = this.students?.find(s => s.student.id === studentId);
      if (student) {
        this.studentForm.patchValue({
          initialMeeting: student.initialMeeting,
          finalMeeting: student.finalMeeting,
        });
      }
    }
  }

  /**
   * Обработчик изменения чекбоксов встреч
   *
   * @param key - тип встречи ('initialMeeting' или 'finalMeeting')
   * @param value - новое значение чекбокса
   */
  onSelect(key: string, value: boolean) {
    if (key === "initialMeeting") {
      this.studentForm.get("initialMeeting")?.setValue(value);
    } else {
      this.studentForm.get("finalMeeting")?.setValue(value);
    }
  }

  /**
   * Инициализация компонента
   *
   * Загружает список студентов из резолвера маршрута
   */
  ngOnInit(): void {
    const students = this.route.data.pipe(map(r => r["students"])).subscribe((r: Student[]) => {
      this.students = r;
    });

    this.subscriptions.push(students);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Сохранение изменений статуса встреч
   *
   * @param id - идентификатор встречи (meetingId)
   *
   * Отправляет обновленные данные о встречах на сервер
   * и обновляет локальное состояние при успешном ответе
   */
  onSave(id: number) {
    if (this.studentForm.invalid) return;

    const { initialMeeting, finalMeeting } = this.studentForm.value;
    this.trajectoryService.updateMeetings(id, initialMeeting, finalMeeting).subscribe(() => {
      // Обновление локальных данных
      const student = this.students?.find(s => s.meetingId === id);
      if (student) {
        student.initialMeeting = initialMeeting;
        student.finalMeeting = finalMeeting;
      }
      this.expandedStudentId = null;
    });
  }

  /**
   * Обработчик изменения размера окна
   *
   * Адаптирует размер аватаров в зависимости от ширины экрана:
   * - Большие экраны (>1200px): аватары 94px
   * - Малые экраны (≤1200px): аватары 48px
   *
   * @param event - событие изменения размера окна
   */
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.avatarSize.set(event.target.innerWidth > 1200 ? 94 : 48);
  }
}
