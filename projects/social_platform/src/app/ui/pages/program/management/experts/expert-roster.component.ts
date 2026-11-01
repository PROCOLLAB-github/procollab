/** @format */

import {
  expertStatusLabel,
  expertStatusDescription,
  expertDeliveryLabel,
  expertInitials,
  expertScopeLabel,
} from "./expert-presentation";
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarComponent, ButtonDirective, ChoiceDirective } from "@uilib";
import { AppRoutes } from "@api/paths/app-routes";
import { ExpertRow } from "@domain/program/evaluation-workspace.model";
import { presentationHref } from "@utils/program-case-analytics";
import {
  RowAction,
  RowActionEvent,
  RowActionsComponent,
} from "@ui/primitives/row-actions/row-actions.component";

// Общее представление roster. Отбор строк, назначения и все операции остаются в V1/V2.
@Component({
  selector: "app-expert-roster",
  imports: [RouterLink, AvatarComponent, ButtonDirective, ChoiceDirective, RowActionsComponent],
  templateUrl: "./expert-roster.component.html",
  styleUrls: [
    "../program-native-button.scss",
    "../program-native-choice.scss",
    "./expert-table.scss",
    "./expert-roster.component.scss",
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertRosterComponent {
  readonly rows = input.required<ExpertRow[]>();
  readonly selectedIds = input.required<Set<number | string>>();
  readonly allSelected = input(false);
  readonly busy = input(false);
  readonly loading = input(false);
  readonly assignmentLabel = input("Проекты");
  readonly page = input(0);
  readonly pageSize = input(20);
  readonly total = input(0);
  readonly emptyText = input("Экспертов пока нет. Пригласите первого эксперта по email.");
  readonly actions = input.required<(expert: ExpertRow) => RowAction[]>();
  readonly toggleAll = output<void>();
  readonly toggleRow = output<ExpertRow>();
  readonly rowClick = output<{ event: MouseEvent; expert: ExpertRow }>();
  readonly action = output<{ expert: ExpertRow; event: RowActionEvent }>();
  readonly pageChange = output<number>();
  readonly paths = AppRoutes;
  readonly href = presentationHref;

  readonly scopeLabel = expertScopeLabel;
  readonly label = expertStatusLabel;
  readonly statusDescription = (row: ExpertRow) =>
    expertStatusDescription(row, this.assignmentLabel());
  readonly deliveryLabel = expertDeliveryLabel;
  readonly initials = expertInitials;
}
