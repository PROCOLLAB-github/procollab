/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  output,
  Output,
} from "@angular/core";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { IconComponent, ButtonComponent } from "@ui/primitives";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { TruncatePipe } from "@corelib";

/** Компонент карточки вакансии с кнопками редактирования и удаления. */
@Component({
  selector: "app-vacancy-card",
  templateUrl: "./vacancy-card.component.html",
  styleUrl: "./vacancy-card.component.scss",
  imports: [IconComponent, ButtonComponent, TagComponent, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyCardComponent implements OnInit {
  readonly vacancy = input<Vacancy | undefined>();

  readonly remove = output<number>();
  readonly edit = output<number>();

  skillString = "";

  ngOnInit(): void {}

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.vacancy()!.id);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.edit.emit(this.vacancy()!.id);
  }
}
