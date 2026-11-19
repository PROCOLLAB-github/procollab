/** @format */
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ProjectRatingComponent } from "@ui/pages/program/detail/list/rating-card/project-rating/project-rating.component";
import { Component, Input } from "@angular/core";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ModalComponent } from "./modal.component";
import {
  DialogHeaderComponent,
  SectionHeaderComponent,
  ButtonDirective,
  FieldDirective,
  IconComponent,
} from "@uilib";

@Component({
  selector: "app-evaluation-editor-example",
  imports: [ModalComponent, DialogHeaderComponent, ButtonDirective, FieldDirective],
  styleUrls: ["./evaluation-standard.stories.scss"],
  template: ` <button appButton="secondary" type="button" (click)="open = true">
      Открыть пример
    </button>
    <app-modal
      [open]="open"
      (openChange)="!busy && (dirty ? (confirmClose = true) : (open = $event))"
      labelledBy="editor-example-title"
      ><section class="example-dialog">
        <app-dialog-header
          title="Пример редактирования критерия"
          titleId="editor-example-title"
          [closeDisabled]="busy"
          (closed)="dirty ? (confirmClose = true) : (open = false)"
        />
        <p class="example-dialog__hint">Демонстрационные данные. Сохранение не подключено.</p>
        @if (confirmClose) {
          <p role="alert">Закрыть без сохранения?</p>
          <button appButton="secondary" type="button" (click)="confirmClose = false">
            Продолжить редактирование</button
          ><button appButton="secondary" type="button" (click)="open = false; confirmClose = false">
            Закрыть
          </button>
        }
        <div class="example-dialog__fields">
          <label style="display:grid;gap:8px"
            >Название критерия<input
              appField
              style="width:100%"
              value="Актуальность проблемы"
              [disabled]="busy"
              (input)="dirty = true" /></label
          ><label style="display:grid;gap:8px"
            >Тип<select appField [disabled]="busy" (change)="dirty = true">
              <option>Целые баллы</option>
              <option>Да / Нет</option>
              <option>Комментарий</option>
            </select></label
          ><label style="display:grid;gap:8px"
            >От<input
              appField
              type="number"
              value="0"
              [disabled]="busy"
              (input)="dirty = true" /></label
          ><label style="display:grid;gap:8px"
            >До<input appField type="number" value="10" [disabled]="busy" (input)="dirty = true"
          /></label>
        </div>
        @if (busy) {
          <p role="status">Сохранение…</p>
        }
      </section></app-modal
    >`,
})
class EvaluationEditorExampleComponent {
  @Input() busy = false;
  @Input() dirty = false;
  open = true;
  confirmClose = false;
}

const meta: Meta = {
  title: "UI/Standards/Evaluation",
  decorators: [
    moduleMetadata({
      imports: [
        EvaluationEditorExampleComponent,
        ModalComponent,
        ProjectRatingComponent,
        ReactiveFormsModule,
        DialogHeaderComponent,
        SectionHeaderComponent,
        ButtonDirective,
        FieldDirective,
        IconComponent,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj;
const preview = (long = false) => ({
  props: {
    open: true,
    control: new FormControl(),
    criteria: (long
      ? [
          {
            id: 1,
            name: "Актуальность проблемы",
            description: "Насколько важна задача.",
            type: "int",
            minValue: 0,
            maxValue: 10,
            value: "",
            expertId: 0,
          },
          {
            id: 2,
            name: "Проработанность решения",
            description: "Оцените полноту решения.",
            type: "int",
            minValue: 0,
            maxValue: 20,
            value: "",
            expertId: 0,
          },
          {
            id: 3,
            name: "Соответствует кейсу",
            description: "Решение соответствует условиям",
            type: "bool",
            minValue: null,
            maxValue: null,
            value: "",
            expertId: 0,
          },
        ]
      : []
    ).concat([
      {
        id: 4,
        name: "Комментарий",
        description: "Впечатления и рекомендации эксперта",
        type: "str",
        minValue: null,
        maxValue: null,
        value: "",
        expertId: 0,
      },
    ]),
  },
  template: `
<button appButton="secondary" type="button" (click)="open=true">Открыть пример</button>
<app-modal [open]="open" (openChange)="open=$event" labelledBy="preview-example-title"><section style="padding:24px;max-width:680px;display:grid;gap:20px;min-width:0;font-size:var(--program-type-body-size);line-height:var(--program-type-body-line)"><app-dialog-header title="Предпросмотр формы эксперта" titleId="preview-example-title" (closed)="open=false" /><p style="margin:0">Ответы в предпросмотре не сохраняются.</p><app-project-rating layout="full" [criteria]="criteria" [formControl]="control" /></section></app-modal>`,
});
const editor = (busy = false, dirty = false) => ({
  props: { busy, dirty },
  template: '<app-evaluation-editor-example [busy]="busy" [dirty]="dirty" />',
});
export const ShortDialog: Story = { render: () => preview() };
export const LongDialog: Story = { render: () => preview(true) };
export const BusyDialog: Story = {
  name: "Пример редактора — сохранение",
  render: () => editor(true),
};
export const UnsavedDialog: Story = {
  name: "Пример редактора — несохраненные данные",
  render: () => editor(false, true),
};
@Component({
  selector: "app-evaluation-screen-example",
  imports: [SectionHeaderComponent, ButtonDirective, FieldDirective, IconComponent],
  styleUrls: ["./evaluation-standard.stories.scss"],
  template: ` <main class="example">
    <p class="example__notice">Демонстрационный экран. Действия и переходы не подключены.</p>
    <div class="example__back">
      <i appIcon icon="left-arrow" appSquare="16" aria-hidden="true"></i>Я организую
    </div>
    <header class="example__program">
      <h1>Демонстрационная программа</h1>
      <span class="example__status">Опубликована</span>
    </header>
    <nav class="example__tabs" aria-label="Разделы программы">
      @for (tab of programTabs; track tab) {
        <span [attr.aria-current]="tab === 'Оценивание' ? 'page' : null">{{ tab }}</span>
      }
    </nav>
    <div class="example__layout">
      <nav class="example__subnav" aria-label="Разделы оценивания">
        @for (tab of evaluationTabs; track tab) {
          <span [attr.aria-current]="tab === 'Эксперты' ? 'page' : null">{{ tab }}</span>
        }
      </nav>
      <section class="example__panel" aria-label="Эксперты программы">
        <app-section-header title="Эксперты"
          ><div class="example__actions">
            <button appButton="primary" type="button" aria-disabled="true">
              Пригласить эксперта</button
            ><button
              appButton="icon"
              class="example__export"
              type="button"
              disabled
              aria-label="Выгрузить экспертов"
            >
              <i appIcon icon="download" appSquare="24" aria-hidden="true"></i>
            </button></div
        ></app-section-header>
        <div class="example__toolbar">
          <label class="example__search"
            >Поиск по имени или почте<input appField type="search" placeholder="Поиск" /></label
          ><button appButton="secondary" type="button" aria-disabled="true">Фильтры</button>
        </div>
        <div class="example__table" role="table" aria-label="Список экспертов">
          <div class="example__columns" role="row">
            <span role="columnheader">Эксперт</span><span role="columnheader">Кейсы</span
            ><span role="columnheader">Статус</span><span role="columnheader">Назначено</span
            ><span role="columnheader">Оценено</span>
          </div>
          <div role="row">
            <p role="cell">Экспертов пока нет. Пригласите первого эксперта по email.</p>
          </div>
        </div>
        <p class="example__count">0–0 из 0</p>
      </section>
    </div>
  </main>`,
  styles: `
    .example {
      max-width: 1080px;
      margin: auto;
      padding: 24px;
      color: var(--black);
      font-family: Mont, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      background: var(--background, #f8f8f8);
    }
    .example__notice {
      margin: 0 0 20px;
      color: var(--grey-for-text);
    }
    .example__back {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      margin-bottom: 24px;
    }
    .example__program {
      display: grid;
      justify-items: start;
      gap: 8px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      font-size: 18px;
      line-height: 27px;
      font-weight: 400;
      color: var(--accent-text);
    }
    .example__status {
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--green-light, #e1f1e8);
      color: var(--black);
    }
    .example__tabs {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      overflow: auto;
      padding: 4px 12px;
      background: var(--grey-button);
      border-radius: 20px;
      margin-bottom: 20px;
    }
    .example__tabs span {
      white-space: nowrap;
      padding: 3px 8px;
    }
    [aria-current="page"] {
      color: var(--accent-text);
    }
    .example__tabs [aria-current="page"] {
      background: var(--accent-light, #eee6fc);
      border-radius: 6px;
    }
    .example__layout {
      display: grid;
      grid-template-columns: 150px minmax(0, 1fr);
      gap: 20px;
    }
    .example__subnav {
      display: grid;
      align-content: start;
      gap: 20px;
      padding-top: 12px;
    }
    .example__panel {
      min-width: 0;
      padding: 24px;
      border-radius: 15px;
      background: var(--light-white);
      display: grid;
      gap: 16px;
    }
    .example__actions,
    .example__toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
    }
    .example__actions {
      flex-wrap: wrap;
    }
    .example__actions button {
      flex-shrink: 0;
      white-space: nowrap;
      max-width: 100%;
    }
    .example__search {
      display: grid;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }
    input {
      width: 100%;
      box-sizing: border-box;
    }
    .example__table {
      min-width: 0;
    }
    .example__columns {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr;
      gap: 12px;
      color: var(--grey-for-text);
      padding: 12px 0;
    }
    .example__table p {
      margin: 0;
      padding: 20px 0;
      border-bottom: 1px solid var(--medium-grey-for-outline);
    }
    .example__count {
      margin: 0;
      text-align: right;
      color: var(--grey-for-text);
    }
    @media (max-width: 650px) {
      .example {
        padding: 16px;
        font-size: 14px;
      }
      .example__back,
      h1 {
        font-size: 16px;
      }
      .example__layout {
        grid-template-columns: minmax(0, 1fr);
        gap: 16px;
      }
      .example__subnav {
        display: flex;
        gap: 16px;
        overflow: auto;
        white-space: nowrap;
        padding: 0 0 8px;
      }
      .example__panel {
        padding: 16px;
      }
      .example__toolbar {
        flex-wrap: wrap;
      }
      .example__search {
        flex-basis: 100%;
      }
      .example__columns {
        display: none;
      }
    }
  `,
})
class EvaluationScreenExampleComponent {
  readonly programTabs = ["Обзор", "Участники", "Проекты", "Оценивание", "Настройки"];
  readonly evaluationTabs = ["Критерии", "Эксперты", "Распределение", "Результаты"];
}
export const EvaluationScreen: Story = {
  name: "Демонстрационный экран оценивания",
  render: () => ({
    moduleMetadata: { imports: [EvaluationScreenExampleComponent] },
    template: "<app-evaluation-screen-example />",
  }),
};
