<!-- @format -->

# Module: `courses`

Образовательные курсы / траектории. Курс содержит модули → модули содержат уроки → уроки содержат задания (`Task`). Пользователь проходит уроки, отвечает на задачи (с разными типами ответов), получает прогресс.

## Назначение

- **Список курсов** (`/office/courses/all`).
- **Детальная страница курса** (`/office/courses/:courseId`) — описание + структура модулей с прогрессом.
- **Урок** (`/office/courses/:courseId/lesson/:lessonId`) — линейное прохождение задач с форм-факторами под разные типы ответов.
- **Результат урока** (`/office/courses/:courseId/lesson/:lessonId/results`) — экран после завершения всех задач урока.
- **Отметка модуля как «увиденного»** (через `SeenModulesStoragePort`) — модальное окно поздравления с завершением модуля показывается ровно один раз.

Курс может быть привязан к программе (`CourseDetail.partnerProgramId`) и наоборот (`Program.courses[]`, `Program.courseId`) — см. [`docs/modules/program.md`](program.md).

---

## Domain (`domain/courses/`)

### `courses.model.ts`

| Тип | Что |
|---|---|
| `CourseCard` | Минимальная карточка для списка: id, title, accessType (`"all_users" \| "program_members" \| "subscription_stub"`), status (`"draft" \| "published" \| "ended"`), avatarUrl, cardCoverUrl, startDate, endDate, dateLabel, isAvailable, progressStatus (`"not_started" \| "in_progress" \| "completed" \| "blocked"`), percent, actionState (`"start" \| "continue" \| "lock"`). |
| `CourseDetail` | Полная карточка с дополнительными полями: description, headerCoverUrl, partnerProgramId, analyticsStub. |
| `CourseStructure` | `{ courseId, progressStatus, percent, modules: CourseModule[] }`. |
| `CourseModule` | id, courseId, title, order, avatarUrl, startDate, status, isAvailable, progressStatus, percent, lessons: `CourseLessons[]`. |
| `CourseLessons` | id, moduleId, title, order, status, isAvailable, progressStatus, percent, currentTaskId, taskCount. |
| `CourseLesson` | Полная информация урока: id, moduleId, courseId, title, progressStatus, percent, currentTaskId, moduleOrder, tasks: `Task[]`. |
| `Task` | id, order, title, answerTitle, status, taskKind (`"question" \| "informational"`), checkType, informationalType, questionType, answerType (см. ниже), bodyText, videoUrl, imageUrl, attachmentUrl, isAvailable, isCompleted, options: `Option[]`. |
| `Option` | id, order, text — для radio/select заданий. |
| `TaskAnswerResponse` | answerId, status (`"submitted" \| "pending_review"`), isCorrect, canContinue, nextTaskId, submittedAt. |

### Типы ответов на задачу (`Task.answerType`)

Используется в шаблонах для рендера разных компонентов:

| Тип | Виджет | Где |
|---|---|---|
| `"text"` | `<app-write-task>` | `pages/courses/lesson/shared/write-task` |
| `"text_and_files"` | `<app-write-task>` (комбо) | то же |
| `"single_choice"` | `<app-radio-select-task>` | `lesson/shared/radio-select-task` |
| `"multiple_choice"` | `<app-exclude-task>` | `lesson/shared/exclude-task` |
| `"files"` | `<app-file-task>` | `lesson/shared/file-task` |
| (informational) | `<app-info-task>` | `lesson/shared/video-task` (info-task.component) — текст / видео / изображение |

### Domain events (`domain/courses/events/`)

| Event | Payload |
|---|---|
| `TaskAnswerSubmitted` | `{ taskId, lessonId, response: TaskAnswerResponse }` |

Событие эмитится после сабмита ответа. Слушает (за пределами модуля) — `ProjectRepository` (см. [`docs/modules/project.md`](project.md)) для инвалидации проектного кеша, если задача изменила его связь.

### Ports

| Port | Файл | Методы |
|---|---|---|
| `CoursesRepositoryPort` | `ports/courses.repository.port.ts` | `getCourses()`, `getCourseDetail(id)`, `getCourseStructure(id)`, `getCourseLesson(id)`, `postAnswerQuestion(taskId, answerText?, optionIds?, fileIds?)` |
| `SeenModulesStoragePort` | `ports/seen-modules-storage.port.ts` | `isSeen(courseId, moduleId): boolean`, `markSeen(courseId, moduleId): void` (синхронный API) |

DI-биндинги (`infrastructure/di/courses/courses.providers.ts`):

```ts
{ provide: CoursesRepositoryPort, useExisting: CoursesRepository },
{ provide: SeenModulesStoragePort, useExisting: LocalStorageSeenModulesAdapter },
```

> `SeenModulesStoragePort` — единственный пример **non-HTTP** порта в приложении. Его реализация — `LocalStorageSeenModulesAdapter`, ключ формата `course_<courseId>_module_<moduleId>_complete_seen`.

---

## Use-cases (5 шт., `api/courses/use-cases/`)

| Use-case | Параметры | Возвращает | Эмитит событие |
|---|---|---|---|
| `GetCoursesUseCase` | — | `Result<CourseCard[], { kind: "get_courses_error"; cause? }>` | — |
| `GetCourseDetailUseCase` | `courseId: number` | `Result<CourseDetail, { kind: "get_course_detail_error"; cause? }>` | — |
| `GetCourseStructureUseCase` | `courseId: number` | `Result<CourseStructure, { kind: "get_course_structure_error"; cause? }>` | — |
| `GetCourseLessonUseCase` | `lessonId: number` | `Result<CourseLesson, { kind: "...error"; cause? }>` | — |
| `SubmitTaskAnswerUseCase` | `taskId: number, answerText?, optionIds?, fileIds?` | `Result<TaskAnswerResponse, { kind: "submit_task_error"; cause? }>` | `TaskAnswerSubmitted` |

---

## Facades (`api/courses/facades/`)

| Facade | Provided | Что |
|---|---|---|
| `CoursesListInfoService` | страница `/courses/all` | Загрузка списка через `GetCoursesUseCase`. |
| `CoursesListUIInfoService` | страница `/courses/all` | `courses$ AsyncState<CourseCard[]>`. |
| `CourseDetailInfoService` | страница `/courses/:id` (provided in `CourseDetailComponent`) | `init()` загружает detail + structure параллельно из resolver-data. `applyCourseData(structure)` дёргает `checkCompletedModules` через `SeenModulesStoragePort`. `redirectDetailInfo(courseId?)`, `redirectToProgram()`. `trackNavigation()` отслеживает переход на /lesson для `isTaskDetail` флага. |
| `CourseDetailUIInfoService` | страница `/courses/:id` | `courseDetail$`, `courseStructure$ AsyncState`, computed `course`, `courseStructure`, `courseModules`, `loading`, `isDisabled` (нет `partnerProgramId`), `isTaskDetail`, `isCompleteModule`, `isCourseCompleted`. |
| `LessonInfoService` | страница `/lesson/:lessonId` (provided in `LessonComponent`) | Полный контроль урока: `init()` подписка на `route.data` для подгрузки `CourseLesson`, `trackNavigation()` для `isComplete` (URL содержит `results`), `onSubmitAnswer()` через `SubmitTaskAnswerUseCase`, переход к следующей задаче. `onSelectTask(task)` (см. портирование канбана в memory). |
| `LessonUIInfoService` | страница `/lesson/:lessonId` (provided in `LessonComponent`) | `lesson$`, `submitAnswer$ AsyncState`. Computed: `lessonInfo`, `tasks`, `currentTask`, `isLastTask`, `isSubmitDisabled` (по `task.answerType`). Сигналы `currentTaskId`, `activeTaskId`, `isComplete`, `loading`, `loader`, `success`, `hasError`, `answerBody`, `completedTaskIds: Set<number>`. Методы: `markTaskCompleted(id)`, `isDone(task)`, `isClickable(task)`, `isViewingCompleted` computed, `lessonOrder` computed (находит lesson в structure через инжектированный `CourseDetailUIInfoService`). |

> `LessonUIInfoService` инжектит `CourseDetailUIInfoService` — это допустимо, потому что `LessonComponent` — child-route `CourseDetailComponent`, и DI-иерархия пробрасывается. См. [`docs/social-platform/architecture.md`](../social-platform/architecture.md).

---

## Repository (`infrastructure/repository/courses/courses.repository.ts`)

`CoursesRepository implements CoursesRepositoryPort`. Использует `EntityCache<CourseDetail>` и `EntityCache<CourseStructure>` для `getCourseDetail` / `getCourseStructure` (двойная инвалидация по разным типам).

`postAnswerQuestion` после успеха эмитит `TaskAnswerSubmitted` через `EventBus`. Это видно в коде:

```ts
return this.coursesAdapter.postAnswerQuestion(...).pipe(
  tap(response => this.eventBus.emit(taskAnswerSubmitted(taskId, lessonId, response)))
);
```

> `lessonId` приходит как параметр snimulated из вызывающей стороны (use-case передаёт). См. конкретно в [`docs/modules/project.md#consumers`](project.md#consumers) — `ProjectRepository` подписан на это событие для инвалидации.

---

## HTTP endpoints (`infrastructure/adapters/courses/courses-http.adapter.ts`)

Префикс `/skills/courses` (исторически — этот модуль создавался в подпроекте skills, который отдельно деплоился; теперь skills-подпроект удалён, но URL остался).

| Метод | HTTP | URL | Параметры | Ответ |
|---|---|---|---|---|
| `getCourses()` | GET | `/skills/courses/` | — | `CourseCard[]` |
| `getCourseDetail(courseId)` | GET | `/skills/courses/<courseId>/` | — | `CourseDetail` |
| `getCourseStructure(courseId)` | GET | `/skills/courses/<courseId>/structure/` | — | `CourseStructure` |
| `getCourseLesson(lessonId)` | GET | `/skills/lessons/<lessonId>/` | — | `CourseLesson` |
| `postAnswerQuestion(taskId, answerText?, optionIds?, fileIds?)` | POST | `/skills/tasks/<taskId>/answer/` | `{ text?, optionIds?, fileIds? }` | `TaskAnswerResponse` |

> Весь модуль использует **основной** API (`API_URL`), не отдельный `SKILLS_API_URL`. Префикс `/skills/...` — историческое наследие.

---

## Routes (`ui/routes/courses/`)

### `courses.routes.ts`

```
/office/courses/
  /                      → redirect to all
  /all                   → CoursesListComponent (resolve: CoursesResolver)
/office/courses/:courseId  → lazy ./course-detail.routes
```

### `course-detail.routes.ts`

```
/office/courses/:courseId
  resolve: CoursesDetailResolver  → [CourseDetail, CourseStructure]
  runGuardsAndResolvers: "always"
  parent: CourseDetailComponent
  /                      → CourseInfoComponent
  /lesson                → lazy ./lesson.routes
```

### `lesson.routes.ts`

```
/office/courses/:courseId/lesson/:lessonId
  component: LessonComponent
  resolve: lessonDetailResolver  → CourseLesson
  /results               → TaskCompleteComponent
```

> `runGuardsAndResolvers: "always"` нужно для `CoursesDetailResolver`, чтобы при переключении между уроками внутри одного курса данные обновлялись.

---

## Pages (`ui/pages/courses/`)

| Page | Файл | Selector | Что |
|---|---|---|---|
| `CoursesComponent` | `pages/courses/courses.component.ts` | `app-courses` | Корневой layout. |
| `CoursesListComponent` | `pages/courses/list/list.component.ts` | `app-courses-list` | Список карточек курсов. |
| `CourseListItemComponent` | `pages/courses/list/course/course.component.ts` | `app-course-list-item` (или похожий) | Карточка курса в списке. |
| `CourseDetailComponent` | `pages/courses/detail/course-detail.component.ts` | `app-course-detail` | Корневой компонент детальной страницы. Provides `CourseDetailInfoService` + `CourseDetailUIInfoService`. Render: левая колонка (cover + кнопка действия) + RouterOutlet с дочерним. Также рендерит `<app-course-about>` (см. [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md)). |
| `CourseInfoComponent` | `pages/courses/detail/info/info.component.ts` | `app-detail` (sic — селектор `app-detail`, отличается от `<app-detail>` виджета) | Содержимое детальной страницы — модули с прогрессом. |
| `CourseModuleCardComponent` | `pages/courses/detail/info/course-module-card/course-module-card.component.ts` | `app-course-module-card` | Карточка модуля с круговым прогрессом. |
| `CircleProgressBarComponent` | `pages/courses/detail/info/course-module-card/circle-progress-bar/circle-progress-bar.component.ts` | `app-circle-progress-bar` | Круговой индикатор прогресса. |
| `LessonComponent` | `pages/courses/lesson/lesson.component.ts` | `app-lesson` | Урок с задачами. Provides `LessonInfoService` + `LessonUIInfoService`. Подключает task-компоненты (write/exclude/file/radio/info) условно по `currentTask().answerType`. |
| `TaskCompleteComponent` | `pages/courses/lesson/complete/complete.component.ts` | `app-task-complete` | Экран результата урока. |
| `WriteTaskComponent` | `lesson/shared/write-task/write-task.component.ts` | `app-write-task` | Форма с текстом и (опционально) файлами. |
| `ExcludeTaskComponent` | `lesson/shared/exclude-task/exclude-task.component.ts` | `app-exclude-task` | Множественный выбор. |
| `RadioSelectTaskComponent` | `lesson/shared/radio-select-task/radio-select-task.component.ts` | `app-radio-select-task` | Один из вариантов. |
| `FileTaskComponent` | `lesson/shared/file-task/file-task.component.ts` | `app-file-task` | Загрузка файлов. |
| `InfoTaskComponent` | `lesson/shared/video-task/info-task.component.ts` | `app-info-task` | Информационная задача (видео / изображение / текст). |
| `ImagePreviewComponent` | `lesson/shared/image-preview/image-preview.component.ts` | `app-image-preview` | Просмотр изображения в модалке. |

### Resolvers

- `CoursesResolver` — список курсов через `GetCoursesUseCase`.
- `CoursesDetailResolver` — параллельная загрузка `[CourseDetail, CourseStructure]` через `forkJoin([GetCourseDetailUseCase, GetCourseStructureUseCase])`.
- `lessonDetailResolver` — `CourseLesson` через `GetCourseLessonUseCase`.

---

## Widgets

| Widget | Где |
|---|---|
| `<app-course-about>` | [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md#programlinkscomponent--courseaboutcomponent) — блок «о курсе» с раскрытием. Используется в `CourseDetailComponent` и `CourseInfoComponent`. |

---

## Consumers (за пределами модуля)

| Где | Как использует |
|---|---|
| `pages/program/...` | `Program.courses[]` — обратная связь курс ↔ программа. |
| `widgets/detail` (через course `partnerProgramId`) | переход программа ↔ курс. |
| `ProjectRepository` (через `EventBus`) | Слушает `TaskAnswerSubmitted` для инвалидации связанных проектов. |

---

## Известные проблемы

| Что | Где | Заметка |
|---|---|---|
| URL `/skills/courses` — наследие от удалённого skills sub-project | `courses-http.adapter.ts` | Бэк не переименовали; на фронте можно завернуть в константу `COURSES_URL_PREFIX`. |
| `Task.answerType: string \| null` — нет union типа | `domain/courses/courses.model.ts` | Зафиксировать union: `"text" \| "text_and_files" \| "single_choice" \| "multiple_choice" \| "files" \| null`. |
| `analyticsStub: any` в `CourseDetail` | `domain/courses/courses.model.ts` | Заглушка для будущей аналитики; пока не используется. Удалить или типизировать. |
| `selector: "app-detail"` в `CourseInfoComponent` совпадает с виджетом `<app-detail>` (DeatilComponent в widgets) | `pages/courses/detail/info/info.component.ts` | Конфликт селекторов — Angular разрешает по моду подключения, но создаёт путаницу. Переименовать в `app-course-info`. |
| `SeenModulesStoragePort` синхронный — миграция на async (например, IndexedDB) потребует изменения портов и адаптеров | `domain/courses/ports/seen-modules-storage.port.ts` | Документировано в комментарии порта. |
| `CourseLesson.moduleOrder` — порядок модуля, но не урока. `lessonOrder` вычисляется только в `LessonUIInfoService` через cross-сервис lookup | `domain/courses/courses.model.ts` | Бэку добавить `lessonOrder` в `CourseLesson` ответ. |
| `lessonId` параметр в `submit-task-answer.use-case.ts` для эмиссии события приходит из `LessonInfoService` — не из use-case context | use-case + facade | Передавать `lessonId` через команду `SubmitTaskAnswerCommand`. |
