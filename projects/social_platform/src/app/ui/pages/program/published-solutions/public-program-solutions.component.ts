/** @format */
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DeatilComponent } from "@ui/widgets/detail/detail.component";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";

/** Public publications reuse the program header without the authenticated office shell. */
@Component({
  selector: "app-public-program-solutions",
  imports: [RouterLink, DeatilComponent],
  template: `<main class="public-program">
    <a routerLink="/" aria-label="PROCOLLAB — главная"
      ><img class="public-program__logo" src="/assets/images/shared/logo.svg" alt="PROCOLLAB"
    /></a>
    <h1 class="public-program__title">{{ program()?.name }}</h1>
    <app-detail [publicationsOnly]="true" />
  </main>`,
  styles: `
    .public-program {
      max-width: 864px;
      margin: 24px auto;
      padding: 0 16px;
      font-family: Mont, sans-serif;
      min-width: 0;
    }
    .public-program__logo {
      width: 140px;
      margin-bottom: 24px;
    }
    .public-program__title {
      font-size: 18px;
      font-weight: 400;
      overflow-wrap: anywhere;
    }
    @media (max-width: 999px) {
      .public-program__title {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProgramSolutionsComponent {
  readonly program = inject(ProgramDetailMainUIInfoService).program;
}
