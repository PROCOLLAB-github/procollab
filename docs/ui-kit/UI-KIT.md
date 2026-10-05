<!-- @format -->

# UI Kit PROCOLLAB

Единые компоненты находятся в `projects/ui/src/lib/components` и экспортируются через `@uilib`. FormControl-компоненты приложения остаются в `@ui/primitives`: их CVA, валидация и доменные интеграции не меняются. Старые импорты Button, Icon, Loader и канбан Badge — реэкспорты тех же классов. Social Avatar наследует inputs canonical Avatar и сохраняет прежнюю desktop presentation через compatibility adapter.

## Desktop compatibility

Responsive/UI Kit presentation ограничена `<1000px`. На desktop ≥1000px legacy consumers сохраняют
композицию и геометрию `dev` до #401: общие Card/Field/Form/Filters adapters не навязывают размеры,
отступы и сетки. Button, Icon, Avatar и PageHeader сохраняют прежние desktop contracts;
требование 44 px для мобильных targets не увеличивает старые desktop кнопки.

Перед изменениями shared styles обязательны desktop pixel comparisons на 1440/1920 и
mobile/tablet проверки на 320/390/768: [gate, эталон и evidence](../desktop-regression/README.md).

| Семейство                                     | Источник                                                                                  | Правило                                                                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button                                        | `ButtonComponent`, `ButtonDirective`                                                      | Primary — главное действие; Secondary — отмена/дополнительное действие; Danger — удаление. Размер цели минимум 44 px. Loading блокирует повторное нажатие и сохраняет доступное имя. |
| Input, Textarea, Select, Autocomplete, Search | `@ui/primitives`, `ui-foundation.control`                                                 | Высота однострочного поля ≥44 px; общий padding, border, focus/error/disabled. На мобильных ввод 16 px. Textarea увеличивается по содержимому.                                       |
| Dropdown                                      | `DropdownComponent`                                                                       | Общая поверхность, отступы, цели выбора 44 px; существующий CDK overlay.                                                                                                             |
| Checkbox, Radio                               | `CheckboxComponent`, `ChoiceDirective`, radio-вариант native Button                       | Общие цвета/focus/disabled. Checkbox доступен с клавиатуры; native radio сохраняет формы и группировку. Rich radio rows используют `role="radio"` и `aria-checked`.                  |
| Tabs                                          | `TabsComponent`                                                                           | Router links или локальные `id`; active, disabled, count, icon; горизонтальный скролл на узком экране. `Bar`, `BarNew`, project/profile navigation — адаптеры.                       |
| Dialog                                        | `ModalComponent`, `DialogHeaderComponent`, `DialogBodyDirective`, `DialogFooterDirective` | Размер small/medium/large из tokens, ограничения viewport, скролл. Заголовок и действия используют общие примитивы. Доменный код сохраняет правила закрытия и восстановления фокуса. |
| Drawer                                        | `DrawerDirective` + существующая навигационная оболочка                                   | Общий предел ширины/overscroll; открытие, Escape, focus trap, route/resize close принадлежат оболочке.                                                                               |
| Card                                          | `CardDirective`, `ui-foundation.card`                                                     | Единая поверхность, радиус, border, padding, hover. Контент, фото, сетка и порядок данных принадлежат entity-компоненту. Высота вмещает контент и CTA.                               |
| Badge/Tag                                     | `BadgeComponent`, `TagComponent`, `ui-foundation.badge`                                   | Единая геометрия. VacancyStatus — адаптер; доступность курса — Badge. Редактируемые tags сохраняют свои действия.                                                                    |
| Table/Pagination                              | `TableDirective`, `PaginationComponent`                                                   | Общие заголовки, строки, hover и действия пагинации. Аналитика сохраняет desktop tables и существующие mobile cards.                                                                 |
| Filters/Form layout                           | `FiltersDirective`, `FormLayoutDirective`                                                 | Общие поля, labels, errors, интервалы секций; доменная группировка и reactive forms сохраняются.                                                                                     |
| Empty/Loading/Error                           | `StateComponent`                                                                          | Текст передаётся страницей; существующие тексты сохраняются. `compact` для сообщений внутри формы/таблицы, обычный вариант для пустого списка.                                       |
| Alerts/Notifications                          | `AlertDirective`, существующий Snackbar                                                   | Семантические info/success/warning/error, status/alert, общая палитра.                                                                                                               |
| Page Header                                   | `PageHeaderComponent`                                                                     | Title, description, breadcrumbs, backRoute, projected actions; единая типографика.                                                                                                   |
| Icon                                          | `IconComponent`                                                                           | Small 16 / medium 20 / large 24; SVG sprite. Явные размеры остаются для существующих декоративных и брендовых изображений.                                                           |

## Tokens

`projects/social_platform/src/styles/_ui-tokens.scss` содержит семантические aliases существующей палитры, H1/H2/H3/Body/Small/Caption, размеры и интервалы. `_ui-foundation.scss` — единственный источник представления Button/Control/Card/Choice/Badge. `_ui-system.scss` применяет ту же основу к native adapters, таблицам, формам и сообщениям.

Размеры сеток, фотографий, графиков и содержимого курса зависят от данных и назначения раздела. Их не следует подменять размерами generic-компонента. Локальный SCSS может задавать расположение и размеры содержимого, но не создавать второй цвет/радиус/focus/hover для общего элемента.

## Использование

```html
<app-page-header title="проекты" backRoute="/office/feed">
  <app-button variant="primary" [loader]="saving()" (click)="save()">Сохранить</app-button>
</app-page-header>

<button appButton="secondary" type="button" (click)="cancel()">Отмена</button>
<app-button variant="danger" (click)="remove()">Удалить</app-button>

<app-state kind="loading" title="Загрузка…" />
<app-state title="Ничего не найдено" description="Попробуйте изменить запрос." />

<app-modal size="medium" [open]="open()" labelledBy="dialog-title" (openChange)="close()">
  <section>
    <app-dialog-header title="Название" titleId="dialog-title" (closed)="close()" />
    <div appDialogBody>Содержимое</div>
    <footer appDialogFooter><app-button variant="primary">Сохранить</app-button></footer>
  </section>
</app-modal>
```

`appButton` сохраняет native `button`, reactive forms, ARIA и `HTMLElement` refs. Внутри ссылки, которая открывает всю карточку, визуальный CTA является неинтерактивным span с `ui-foundation.button`: это та же основа без вложенной кнопки и второго tab stop. Старые `color`, `appearance`, `size` сохранены для совместимости; новые действия используют semantic variant.

## Проверка

```powershell
npm run build:social:prod
npm run test:ci
npm run lint:ts
npm run lint:scss
node docs/ui-kit/audit.cjs
```

Browser-проверки используют `docs/responsive/browser-harness.cjs`, локальный `serve.cjs`, Playwright и синтетические API fixtures. Они не отправляют изменения в настоящий backend. `PLAYWRIGHT_MODULE` и `CHROME_PATH` задают установленные runtime/browser paths.
