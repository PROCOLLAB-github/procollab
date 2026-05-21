<!-- @format -->

# `@corelib` — pipes

Все пайпы лежат в `projects/core/src/lib/pipes/` и сгруппированы по назначению. Все `standalone: true`.

```
pipes/
  controls/      # пайпы для Reactive Forms
  formatters/    # форматирование значений в строку (даты, числа, текст)
  transformers/  # трансформация в другие сущности (опции, размеры, домен ссылки)
  user/          # пользователь-специфичные (роль, ссылки)
  truncate-html.pipe.ts   # отдельный — работает с SafeHtml
```

## Сводка

| Pipe                    | Файл                                       | Имя в шаблоне       | Сигнатура                                                | Назначение                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------ | ------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ControlErrorPipe`      | `controls/control-error.pipe.ts`           | `controlError`      | `(ctrl: AbstractControl, errorName?) => boolean`         | Показывать ли ошибку в UI. Если `errorName` не задано — `ctrl.touched && ctrl.invalid`. Если задано — конкретная ошибка. `pure: false` — пересчитывается на каждый change-detection (важно для form state). |
| `FormControlPipe`       | `controls/form-control.pipe.ts`            | `formControl`       | `(ctrl: AbstractControl) => FormControl`                 | Type-cast для шаблонов: `form.get('x') \| formControl`. Без runtime-проверки.                                                                                                                               |
| `DayjsPipe`             | `formatters/dayjs.pipe.ts`                 | `dayjs`             | `(value, type, options?) => string \| number \| boolean` | См. ниже. Расширяется плагинами `relativeTime` и `isToday`, локаль `ru`.                                                                                                                                    |
| `YearsFromBirthdayPipe` | `formatters/years-from-birthday.pipe.ts`   | `yearsFromBirthday` | `(value: string) => string`                              | "25 лет" / "1 год" / "2 года" — через `PluralizePipe`.                                                                                                                                                      |
| `ParseBreaksPipe`       | `formatters/parse-breaks.pipe.ts`          | `parseBreaks`       | `(value: string) => string`                              | `\n` → `<br>`.                                                                                                                                                                                              |
| `ParseLinksPipe`        | `formatters/parse-links.pipe.ts`           | `parseLinks`        | `(value: string) => string`                              | URL'ы в тексте → `<a href="...">URL</a>` через `linkify-string`.                                                                                                                                            |
| `PluralizePipe`         | `formatters/pluralize.pipe.ts`             | `pluralize`         | `(n: number, words: [string, string, string]) => string` | Русское склонение по числу: `(2, ["год","года","лет"]) => "года"`.                                                                                                                                          |
| `CapitalizePipe`        | `formatters/capitalize.pipe.ts`            | `capitalize`        | `(value: string) => string`                              | Первый символ в верхний регистр.                                                                                                                                                                            |
| `TruncatePipe`          | `formatters/truncate.pipe.ts`              | `truncate`          | `(value, limit=30, ellipsis="...") => string`            | Обрезка по длине с многоточием.                                                                                                                                                                             |
| `TruncateHtmlPipe`      | `truncate-html.pipe.ts`                    | `truncateHtml`      | `(value: string, limit: number) => SafeHtml`             | Обрезка с сохранением валидной HTML-разметки, возвращает `SafeHtml` через `DomSanitizer`.                                                                                                                   |
| `FormatedFileSizePipe`  | `transformers/formatted-file-size.pipe.ts` | `formatedFileSize`  | `(bytes: number) => string`                              | "1.5 MB" / "256 KB" / "0 Bytes". База 1024.                                                                                                                                                                 |
| `LinkTransformPipe`     | `transformers/link-transform.pipe.ts`      | `linkTransform`     | `(value: string) => string`                              | Извлекает домен между `https://` и первой точкой. **Работает только с HTTPS**. `https://github.com/x` → `"github"`.                                                                                         |
| `ToSelectOptionsPipe`   | `transformers/options-transform.pipe.ts`   | `toSelectOptions`   | `(values: string[]) => { value, label, id }[]`           | Преобразование плоского `string[]` в формат опций `<app-select>`.                                                                                                                                           |
| `SalaryTransformPipe`   | `transformers/salary-transform.pipe.ts`    | `salaryTransform`   | `(value: string) => string`                              | `"50000"` → `"50 000"` через `toLocaleString("ru-RU")`. Если `parseInt` дал `NaN` — возвращает исходное.                                                                                                    |
| `UserLinksPipe`         | `user/user-links.pipe.ts`                  | `userLinks`         | `(value: string) => { iconName, tag }`                   | Распознаёт домен ссылки и возвращает иконку + читаемый тег. Маппинг: `t.me` → `telegram`, `vk.com` → `vk`. Email-адреса и file-ссылки (`procollab_media`, `api.selcdn.ru`) обрабатываются отдельно.         |
| `UserRolePipe`          | `user/user-role.pipe.ts`                   | `userRole`          | `(value: number) => Observable<string \| undefined>`     | Числовой `userType` → название роли. **Возвращает `Observable`** (резолвится через сервис ролей), значит в шаблоне нужен `\| async`.                                                                        |

## DayjsPipe — таблица типов

| `type`       | Что возвращает                                                       | Параметры                                           |
| ------------ | -------------------------------------------------------------------- | --------------------------------------------------- |
| `"toX"`      | `dayjs().to(dayjs(value), true)` — например `"2 часа"` без префикса  | —                                                   |
| `"fromX"`    | `dayjs(value).from(dayjs(), true)` — например `"3 дня"` без префикса | —                                                   |
| `"diffDay"`  | `dayjs(value).diff(dayjs(), "day")` — целое число                    | —                                                   |
| `"diffHour"` | то же в часах                                                        | —                                                   |
| `"isToday"`  | `dayjs(value).isToday()` — boolean                                   | —                                                   |
| `"format"`   | `dayjs(value).format(options)`                                       | `options` = строка формата, например `"DD.MM.YYYY"` |
| прочее       | `throw new Error("Invalid action type specified: ...")`              | —                                                   |
