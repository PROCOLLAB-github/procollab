/** @format */

import { Component, EventEmitter, Input, OnInit, Output, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@error/models/error-message";
import { Invite } from "@models/invite.model";
import { IconComponent, ButtonComponent, SelectComponent, InputComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { rolesMembersList } from "projects/core/src/consts/lists/roles-members-list.const";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";

/**
 * Компонент карточки приглашения в команду или проект
 *
 * Функциональность:
 * - Отображает информацию о приглашении (роль, специализация)
 * - Позволяет редактировать роль и специализацию приглашенного пользователя
 * - Предоставляет возможность удаления приглашения
 * - Управляет модальными окнами для подтверждения действий
 *
 * Входные параметры:
 * @Input invite - объект приглашения (обязательный)
 * @Input type - тип приглашения: "team" или "invite" (по умолчанию "invite")
 *
 * Выходные события:
 * @Output remove - событие удаления приглашения, передает ID приглашения
 * @Output edit - событие редактирования приглашения, передает объект с ID, ролью и специализацией
 */
@Component({
  selector: "app-invite-card",
  templateUrl: "./invite-card.component.html",
  styleUrl: "./invite-card.component.scss",
  standalone: true,
  imports: [
    IconComponent,
    ButtonComponent,
    ModalComponent,
    SelectComponent,
    ControlErrorPipe,
    TruncatePipe,
    ReactiveFormsModule,
    InputComponent,
    AvatarComponent,
  ],
})
export class InviteCardComponent implements OnInit {
  constructor(private readonly fb: FormBuilder) {
    this.inviteForm = this.fb.group({
      role: [""],
      specialization: [null],
    });
  }

  readonly rolesMembersList = rolesMembersList;

  inviteForm: FormGroup;
  errorMessage = ErrorMessage;

  @Input({ required: true }) invite!: Invite;

  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<{ inviteId: number; role: string; specialization: string }>();

  ngOnInit(): void {
    if (this.invite) {
      this.inviteForm.patchValue({
        role: this.invite.role,
        specialization: this.invite.specialization,
      });
    }
  }

  // Сигналы для управления состоянием модальных окон
  isRemoveInviteModal = signal(false);
  isEditInviteModal = signal(false);

  /**
   * Обработчик удаления приглашения
   * Предотвращает всплытие события и эмитит событие удаления
   */
  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.invite?.id);
  }

  /**
   * Обработчик редактирования приглашения
   * Закрывает модальное окно и эмитит событие редактирования с данными формы
   */
  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.isEditInviteModal.set(false);

    this.edit.emit({
      inviteId: this.invite?.id,
      role: this.inviteForm.value.role,
      specialization: this.inviteForm.value.specialization,
    });
  }
}
