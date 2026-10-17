<!-- @format -->

# Перетаскивание файла в материал программы

Локальная итерация согласованной формы по запросу организатора от 17.10.2026.
Источник: существующий `ProgramManagementComponent`, `FileService` (`POST /files/`, FormData)
и `ModalComponent` (CDK portal). Общий `UploadFileComponent` заявляет drag-and-drop в
описании, но обработчиков не имеет; его поведение в остальных разделах не меняется.

## Ожидаемое поведение

- D1: один файл можно бросить в форму материала, включая режим «Ссылка».
  Источник становится «Файл», сохраняются название и введённая ссылка.
  Передача файла и сохранение материала используют существующие API.
- D2: область подсвечивается при перетаскивании, не мигает при переходе между
  дочерними элементами. Загрузка и имя файла видны; доступна кнопка выбора/замены.
- D3: во время загрузки/сохранения повторная загрузка и закрытие заблокированы.
  Несколько файлов отклоняются с пояснением. Обычный текст не запускает загрузку.
- D4: ошибка загрузки оставляет данные формы и прежний файл; возможен повтор.
  Для HTTP 413 показано сообщение о размере. Новых клиентских ограничений нет.
- D5: поля, кнопки и radio в перенесённом CDK portal сохраняют оформление DS.
  На узком экране форма прокручивается, действия доступны без горизонтального overflow.

Роли, права, API payload, хранение/удаление UserFile и остальные разделы не меняются.
Используются Mont, существующие Button/Field/Choice и токены PROCOLLAB.

## Проверки

- Checked by source: API, права, payload и retention UserFile сохранены; общий upload
  компонент и ModalComponent не менялись. Компонентные DS mixin теперь применяются
  к scoped элементам без зависимости от `:host`, включая CDK portal.
- Checked by tests: 305 tests / 40 files PASS (management, program API facades,
  file service, modal); пять новых DOM сценариев покрывают D1–D4.
- Checked by build: Angular development build PASS на итоговом коде.
- Checked in browser: Chrome, 1440×1000 и 360×740; drag highlight, multipart upload,
  file/link переключение, create/edit/delete через локальный Django/PostgreSQL,
  HTTP 413 → retry, имя файла и мобильные действия — PASS, page errors: 0.
- Not checked: настоящее внешнее хранилище Selectel и авторизованная organizer-сессия
  на dev. В локальном API заменён только storage adapter; auth, multipart, UserFile,
  permissions и materials persistence использованы настоящие.

Скриншоты: [desktop](material-drop-20261017/dialog-desktop.png),
[mobile](material-drop-20261017/dialog-mobile.png).

## Requirement audit / review

| AC  | Verdict | Evidence                                                                    |
| --- | ------- | --------------------------------------------------------------------------- |
| D1  | PASS    | DOM drop test; browser multipart → real local material create               |
| D2  | PASS    | DOM nested drag transitions; desktop/mobile screenshots, picker             |
| D3  | PASS    | Busy/repeated drop/close and multiple/text DOM tests                        |
| D4  | PASS    | Failed replacement + retry DOM and browser HTTP 413                         |
| D5  | PASS    | Browser computed styles: input 45.6 px, button 44 px; responsive screenshot |

Review: BLOCKER/MAJOR/MINOR findings отсутствуют. Сохранены существующие typography,
palette, hierarchy, focus trap и доступный выбор файла с клавиатуры. Поле с названием,
источник и действия идут в порядке чтения; мобильные действия расположены вертикально.
