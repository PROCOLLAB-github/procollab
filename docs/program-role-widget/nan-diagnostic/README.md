<!-- @format -->

# Диагностика PUT /projects/NaN/ — 14.09.2026

Ошибка воспроизведена на точном Angular base и head, в том числе при новом входе из виджета. В проверенных сценариях #348 её не усиливает. Выбран вариант Б из задания: код редактора не меняется, подготовлена [отдельная задача P1](editor-task.md). **Несохранение удаления презентации и ложное сообщение об успехе — препятствие для дальнейшего релиза редактора.** Это отдельный существующий дефект, а не исправление или регрессия виджета.

## Версии и изоляция

| Репозиторий         | Base / origin/dev при проверке             | Проверенный head                           |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| Angular, Draft #348 | `99c8813a66f89560a946eab7d1de73ab2925d0f5` | `239e3a5eafe653291daf95930ecac9824314f365` |
| Backend, Draft #742 | `ed5244bd4a098bd0f1cee0f5e380dd67bdd61a96` | `3d84c7f4090985e4f42a13654e8fb05856f65cb3` |

`git fetch origin`, локальные/удалённые SHA и состояние обоих Draft PR проверены. Рабочие деревья перед диагностикой чистые. Base запущен из отдельного detached worktree. Этот follow-up добавляет только документацию и артефакты; проверенный production-код Angular остаётся кодом `239e3a5…`. Backend не изменён.

Оба Angular используют Node **24.18.0**, npm **11.16.0**, один неизменённый `node_modules` через junction. Head обслуживался на `localhost:4314`, base на `localhost:4315`, один backend head на `localhost:8010`. Только новая локальная PostgreSQL БД `procollab_widget_nan_20260914`, без DEV/PROD данных.

Перед каждым из семи прогонов восстанавливались одинаковые синтетические данные: лидер 11, член команды 12, программа 21, проект **31**, связь **73**, системный `case`, исходные название/описание, `draft=true`, `submitted=false`, исходный кейс. В файловой паре дополнительно восстанавливались один и тот же `UserFile`, URL и физический тестовый файл. Связь не сдавалась. Для обычного поля использовано новое непустое название, для кейса — второй явно выбранный вариант.

Наблюдение добавлено отдельной локальной точкой входа Angular, одинаковой на base/head: обёртки оригинальных методов логируют arguments/stack, `ActivatedRoute`, XHR send/loadend, уничтожение компонента/подписок и события виджета. Аргументы и возвращаемые значения оригинальных вызовов сохранены; ID, обработчики ошибок и запросы не подменялись. Production-файлы не редактировались. Локальные environment/index исключают внешние интеграции и направляют API в 8010. Для удаления файла только внешний CDN-транспорт заменён локальным файловым хранилищем; реальные `FileView`, авторизация, удаление `UserFile` и обновление `Project` работают на backend head. Живой CDN не проверялся.

## Причина и initiator

Место появления неверного ID: [project-form-autosave.service.ts:47](../../../projects/social_platform/src/app/api/project/facades/edit/project-form-autosave.service.ts) в проверенной версии (путь из корня репозитория: `projects/social_platform/src/app/api/project/facades/edit/project-form-autosave.service.ts`).

```ts
const projectId = Number(this.route.snapshot.params["projectId"]);
```

Сервис предоставлен в root и внедряет root `ActivatedRoute`. В реальном runtime у него `route === route.root`, `params={}`. ID существует на дочернем маршруте `office → "" → projects → :projectId/edit`, где `params={projectId:"31"}`. Поэтому получается `Number(undefined) === NaN`. Это не путаница с `programLinkId=73` и не отсутствие разрешённого проекта.

Цепочка при открытии, подтверждённая стеком и source maps:

1. `ProjectEditComponent.ngAfterViewInit` (`edit.component.ts:146`).
2. `ProjectsEditInfoService.loadProgramTagsAndProject` → `route.data.subscribe` (`projects-edit-info.service.ts:381,390`).
3. `ProjectFormService.initializeProjectData` → `projectForm.patchValue` (`project-form.service.ts:63`), с обычным `emitEvent=true`.
4. Инициализация пустой `presentationAddress` попадает в `valueChanges → filter(value => !value) → concatMap` cleanup-autosave; он не отличает заполнение формы из API от пользовательского удаления.
5. `ProjectFormAutosaveService:47,50` → `UpdateFormUseCase.execute:19` → `ProjectRepository.update:132` → `ProjectHttpAdapter.putUpdate:34` → `ApiService.put` → XHR `PUT /projects/NaN/`, body `{"presentation_address":"","draft":true}`, HTTP 404.

При настоящем удалении цепочка начинается с `UploadFileComponent.onRemove`, успешного `DELETE /files/?link=…`, затем `onChange("")` (`upload-file.component.ts:158`) и той же подписки autosave. После повторного открытия уже удалённого файла DELETE возвращает 404; существующий error-handler тоже очищает control, запуская тот же NaN PUT.

Сохранены исходные браузерные XHR-стеки (лимит 100 frames), отдельные use-case/adapter стеки и их source-map frames: [head — открытие](head-existing-initiator.txt), [base — открытие](base-existing-initiator.txt), [head — удаление](head-file-initiator.txt), [base — удаление](base-file-initiator.txt). XHR-стек занят глубокой RxJS-цепочкой; отдельные стеки границ use-case/adapter показывают исходные методы приложения и связываются по времени, ID и payload. Приложены [точный диагностический observer](observer.ts.txt) и [выдержка backend-лога DELETE](file-delete-results.txt); это артефакты документации, не подключённый код приложения.

## Сценарии и сохранение

Все действия выполнены через реальный UI лидером проекта / участником программы. После открытия, изменения и выхода использованы одинаковые **10-секундные окна наблюдения**. API читался отдельным авторизованным запросом после этих окон; фактические абсолютные timestamps сохранены. Время между инструментальными шагами не было побайтно одинаковым. В head-existing/head-case штатный refresh обработал 401 истёкшего токена перед успешным сохранением полей; при head-file он обработал 401 DELETE. Это отмечено в evidence и не скрыто как одинаковая полная сетевая последовательность.

| Прогон        | Вход и полный маршрут редактора                                                                                                                               | NaN / результат                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| head-widget   | `/office/program/21` → виджет «Открыть» → `/office/projects/31?programLinkId=73` → существующее «редактировать» → `/office/projects/31/edit?editingStep=main` | 1 PUT при инициализации пустой презентации; после смены названия новых PUT нет; явное сохранение `/projects/31/` 200         |
| head-existing | `/office/projects/31` → «редактировать» → `/office/projects/31/edit?editingStep=main`                                                                         | Те же 1 NaN при открытии и успешное явное сохранение названия                                                                |
| base-existing | Тот же существующий путь, порт 4315                                                                                                                           | Те же 1 NaN при открытии и успешное явное сохранение названия                                                                |
| head-case     | `/office/program/21` → существующее «перейти в заявку» → `/office/projects/31/edit?editingStep=additional&fromProgram=true&programLinkId=73`                  | 1 NaN при инициализации основной формы; выбранный кейс сохраняется через `/programs/partner-program-projects/73/fields/` 200 |
| base-case     | Тот же существующий путь и query, порт 4315                                                                                                                   | Те же 1 NaN и успешное сохранение кейса связи 73                                                                             |
| head-file     | Существующий путь на main; презентация и обложка изначально непустые                                                                                          | 0 NaN при открытии, по 1 NaN на каждое из двух удалений; очистка ссылки не сохраняется даже явной кнопкой                    |
| base-file     | Тот же путь и исходный физический файл                                                                                                                        | Те же запросы и та же несохранённая очистка                                                                                  |

Вход через карточку не создаёт нового editor-route: существующая ссылка «редактировать» снимает query `programLinkId` с detail; текущий legacy-контекст в этом сценарии разрешает связь 73. Канонический вход программы сохраняет `programLinkId=73` в editor query. NaN в обоих случаях возникает из root params, до сохранения кейса.

Повторные GET `/projects/31/` и `/programs/partner-program-projects/73/fields/` подтвердили:

- Название: после изменения и ожидания исходное; после «сохранить черновик», выхода и ожидания — новое. Автосохранение обычного названия не предусмотрено данным binding.
- Кейс: до явного сохранения исходный, после него — новый, именно на связи 73. NaN не является запросом сохранения кейса.
- Презентация: до удаления URL существует, GET файла 200. После удаления control пустой, DELETE 204, GET файла 404, но GET проекта сохраняет старый URL. После ухода и повторного открытия он остаётся тем же; поле показывает **«Файл успешно загружен»**.
- Повторная очистка и **явное сохранение** показывают **«данные успешно сохранены»** и получают 200 для `/projects/31/`, однако `presentation_address` отсутствует в payload, а ответ и последующий GET по-прежнему содержат удалённый URL. Причина: `ProjectFormService.getFormValue` (`project-form.service.ts:132`) вызывает `stripNullish`; `utils/stripNull.ts:26` удаляет пустые строки из payload. В итоге NaN PUT был единственной попыткой записать очистку поля. Это подтверждённая потеря изменения и ложный общий успех для данного сценария, а не предполагаемая потеря любых данных.

[Все 7 timelines, payload, route trees и 23 контрольных чтения API](evidence.json). [Состояние после повторного открытия на head](head-file-reopened.png) и [на base](base-file-reopened.png): оба скриншота viewport 1280 × 720, показывают тот же удалённый файл как загруженный. У head во время получения полного снимка инструмент изменил viewport; для восстановления отображения сделан дополнительный reload. Он не изменял данные и не создал PUT; итоговый артефакт — обычный viewport-снимок. Вывод об удалении установлен до этого по API и повторён на base.

## Lifecycle и связь с виджетом

Cleanup-autosave не использует debounce/таймер; `concatMap` стартует на emission, включая начальный `patchValue`. Очередь `project-autosave-queue` была пустой во всех загрузках. Код constructor/online flush прочитан: это отдельный root callback; offline/reconnect с непустой очередью в этом задании не моделировался и не объявляется проверенным.

При уходе через навигацию и после явного сохранения зафиксированы `ProjectEditComponent.ngOnDestroy` и уничтожение двух binding активной формы через `takeUntilDestroyed(destroyRef)`. В каждом 10-секундном окне после destroy — **0 новых PUT**. Это проверка подписок формы редактора, а не утверждение об уничтожении root-сервисов и всех созданных в приложении форм. Указанная ошибка не вызвана поздним callback после уничтожения редактора в этих сценариях; обобщение на произвольные сетевые гонки не делается.

На head `ProgramWidgetChanged` происходит после успешного сохранения программных полей, позже NaN. Ни одного дополнительного NaN после этого события не было. На base, где нового события/виджета нет, причина, payload и влияние на сохранение те же. Подписка очистки файлов не зависит от EventBus виджета.

## Выполненные проверки и ограничения

Две локальные diagnostic-сборки **PASS** (Angular development / strict compilation):

```sh
# В head worktree; временный entrypoint наблюдает оригинальные методы.
npm exec -- ng build social_platform --configuration development --browser tmp/nan-trace.ts --ts-config tmp/nan-tsconfig.json --index tmp/nan-index.html --output-path tmp/nan-head
# В detached worktree точного base, те же entrypoint/env/dependencies.
npm exec -- ng build social_platform --configuration development --browser tmp/nan-trace.ts --ts-config tmp/nan-tsconfig.json --index tmp/nan-index.html --output-path tmp/nan-base
```

Проверка собранных логов: 7 прогонов, 23 GET-checkpoints, ожидаемое число NaN/404, root params и leaf ID, пустая очередь, отсутствие PUT в окнах после destroy, отсутствие `presentation_address` в явном файловом save — **PASS**. Это диагностика уже существующей ошибки, не регрессионный тест исправления.

Production-код не менялся, поэтому targeted/full suite, lint:ts и production build заново не запускались. Предыдущие результаты относятся к тому же коду `239e3a5…`: targeted 349 PASS; full head 1560 / base 1489 тестов прошли, оба процесса exit 1 из-за известного ngx-autosize teardown. Это не объявляется зелёным full suite; его расследование не повторялось. [Команды и прежние точные результаты](../followup/README.md#сравнение-ошибки-full-suite).

В этом follow-up проверены scoped Prettier для изменённых Markdown/JSON и `git diff --check`. Глобальный pre-commit с `stylelint --fix` по всем SCSS не запускался для коммита документации, чтобы не форматировать посторонний код. React/current_application/права/композиция виджета/новости и backend production-файлы не изменялись. Merge, deploy и действия с PROD не выполнялись. [Отдельная задача редактора](editor-task.md) подготовлена без создания нового PR или автоматического исправления данных.
