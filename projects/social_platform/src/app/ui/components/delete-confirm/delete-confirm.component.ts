/** @format */

import { Component, OnInit } from "@angular/core";
import { ModalService } from "@ui/models/modal.service";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AsyncPipe } from "@angular/common";
import { ModalComponent } from "../modal/modal.component";

/**
 * Компонент диалога подтверждения удаления.
 * Отображает модальное окно с вопросом о подтверждении удаления элемента.
 * Работает в связке с ModalService для управления состоянием диалога.
 *
 * Функциональность:
 * - Отображение кастомного текста подтверждения
 * - Кнопки подтверждения и отмены
 * - Передача результата выбора через ModalService
 *
 * Не принимает входящих параметров - получает данные через ModalService
 */
@Component({
  selector: "app-delete-confirm",
  templateUrl: "./delete-confirm.component.html",
  styleUrl: "./delete-confirm.component.scss",
  standalone: true,
  imports: [ModalComponent, IconComponent, ButtonComponent, AsyncPipe],
})
export class DeleteConfirmComponent implements OnInit {
  constructor(public readonly modalService: ModalService) {}

  ngOnInit(): void {}

  /**
   * Обработчик результата выбора пользователя
   * @param result - true для подтверждения, false для отмены
   */
  onResult(result: boolean): void {
    this.modalService.confirmObserver?.next(result);
    this.modalService.confirmObserver?.complete();

    this.modalService.confirmState = false;
  }

  /** Observable с настройками текста диалога */
  settings$ = this.modalService.confirmSettings.asObservable();
}
