/** @format */

export interface ProgramGuideStep {
  section: string;
  tab?: string;
  title: string;
  text: string;
  target: string;
  advance?: "click" | "manual";
  optional?: boolean;
  when?: string;
}

export interface ProgramGuide {
  id: string;
  title: string;
  description: string;
  requiredTab?: string;
  publishedOnly?: boolean;
  draftOnly?: boolean;
  steps: readonly ProgramGuideStep[];
}

const anchor = (name: string) => `[data-program-guide="${name}"]`;
const rowTrigger = (name: string) => `${anchor(name)} > button.row-actions__trigger`;
const rowMenu = (rowLabel: string) => `[role="menu"][aria-label^="${rowLabel}"]`;
const rowAction = (rowLabel: string, label: string) =>
  `${rowMenu(rowLabel)} [role="menuitem"][aria-label="${label}"]`;

export const PROJECT_LIST_GUIDES: readonly ProgramGuide[] = [
  {
    id: "projects-empty",
    title: "Проекты",
    description: "Пустой список",
    steps: [
      {
        section: "projects",
        title: "Первые проекты и заявки",
        text: "Когда в программе появятся проекты или заявки, здесь можно будет открыть их карточки, посмотреть команды и выгрузить список.",
        target: anchor("projects-empty"),
      },
    ],
  },
  {
    id: "projects-filtered-empty",
    title: "Проекты",
    description: "Поиск без результатов",
    steps: [
      {
        section: "projects",
        title: "По текущему запросу ничего не найдено",
        text: "Измените запрос или сбросьте фильтры. Если появятся результаты, можно продолжить инструкцию по списку.",
        target: anchor("projects-filtered-empty"),
      },
    ],
  },
  {
    id: "projects-page-empty",
    title: "Проекты",
    description: "Пустая страница",
    steps: [
      {
        section: "projects",
        title: "На этой странице нет заявок",
        text: "Перейдите на первую страницу. Когда заявки загрузятся, инструкция продолжится.",
        target: anchor("projects-page-empty"),
      },
    ],
  },
  {
    id: "projects-archive-empty",
    title: "Проекты",
    description: "Пустой архив",
    steps: [
      {
        section: "projects",
        title: "Архив пока пуст",
        text: "Здесь будут видны заявки, перенесенные в архив. Чтобы посмотреть текущие заявки, вернитесь к списку.",
        target: anchor("projects-archive-empty"),
      },
    ],
  },
];

export const PROGRAM_GUIDES: readonly ProgramGuide[] = [
  {
    id: "launch-v1",
    title: "Запуск программы",
    description: "Подготовка страницы, регистрации и публикация",
    draftOnly: true,
    steps: [
      {
        section: "overview",
        title: "Подготовка к запуску",
        text: "В «Обзоре» видно, какие настройки уже готовы. Откройте нужный пункт, внесите изменения и вернитесь к списку.",
        target: anchor("launch-checklist"),
      },
      {
        section: "overview",
        title: "Страница программы",
        text: "Заполните основную информацию. После сохранения можно открыть предпросмотр по названию программы.",
        target: anchor("launch-check-page"),
      },
      {
        section: "overview",
        title: "Сроки программы",
        text: "Укажите даты программы и регистрации. Проверьте время по Москве.",
        target: anchor("launch-check-dates"),
      },
      {
        section: "overview",
        title: "Регистрация участников",
        text: "Выберите способ регистрации и проверьте, какие данные нужно собрать у участников.",
        target: anchor("launch-check-registration"),
      },
      {
        section: "overview",
        title: "Кейсы",
        text: "Если команды выбирают кейс, добавьте кейсы в настройках заявки проекта.",
        target: anchor("launch-check-cases"),
        optional: true,
      },
      {
        section: "overview",
        title: "Публикация",
        text: "Когда все обязательные пункты будут готовы, нажмите «Опубликовать программу». После подтверждения можно скопировать ссылку для участников.",
        target: anchor("launch-publish"),
      },
    ],
  },
  {
    id: "participants-v1",
    title: "Участники",
    description: "Поиск, анкеты, действия и выгрузка",
    steps: [
      {
        section: "participants",
        title: "Поиск участника",
        text: "Введите имя или почту участника.",
        target: anchor("participants-search"),
      },
      {
        section: "participants",
        title: "Фильтры",
        text: "Уточните список по региону или периоду последней активности.",
        target: anchor("participants-filters"),
      },
      {
        section: "participants",
        title: "Выгрузка участников",
        text: "Кнопка с иконкой скачивания выгружает список в Excel с учетом поиска и фильтров. Для выгрузки отдельных участников отметьте нужные строки.",
        target: anchor("participants-export"),
      },
      {
        section: "participants",
        title: "Действия участника",
        text: "Откройте меню ⋮ в строке участника.",
        target: rowTrigger("participants-actions"),
        advance: "click",
        optional: true,
      },
      {
        section: "participants",
        title: "Профиль, анкета и удаление",
        text: "Из меню можно открыть профиль участника и посмотреть анкету, если в ней есть ответы. «Удалить из программы» сначала открывает окно, где можно проверить последствия для регистрации, команд и заявок.",
        target: rowMenu("Действия участника: "),
        optional: true,
      },
    ],
  },
  {
    id: "participant-empty-v1",
    title: "Если пока нет участников",
    description: "Первые регистрации и ссылка на программу",
    steps: [
      {
        section: "participants",
        title: "Первые регистрации",
        text: "Участники появляются здесь после регистрации. Если список опустел после поиска, очистите поиск и фильтры.",
        target: anchor("participants-empty"),
        optional: true,
      },
      {
        section: "participants",
        title: "Ссылка для приглашения",
        text: "Откройте страницу по названию программы и поделитесь ссылкой после публикации. Сроки и способ регистрации можно проверить в «Настройках».",
        target: anchor("program-page"),
      },
    ],
  },
  {
    id: "projects-v1",
    title: "Проекты",
    description: "Список, карточка, состав команды и выгрузка",
    requiredTab: "projects",
    steps: [
      {
        section: "projects",
        title: "Список проектов",
        text: "Найдите проект или заявку по названию.",
        target: anchor("projects-search"),
      },
      {
        section: "projects",
        title: "Фильтры проектов",
        text: "Сузьте список по кейсу или статусу сдачи решения, если эти фильтры доступны в программе.",
        target: anchor("projects-filters"),
      },
      {
        section: "projects",
        title: "Выгрузка",
        text: "Выгрузите проекты или заявки в Excel с учетом выбранных фильтров.",
        target: anchor("projects-export"),
      },
      {
        section: "projects",
        title: "Карточка проекта",
        text: "Нажмите на название в строке, чтобы посмотреть данные проекта или заявки.",
        target: anchor("projects-card"),
        optional: true,
      },
      {
        section: "projects",
        title: "Действия с проектом",
        text: "Откройте меню ⋮ в строке проекта или заявки.",
        target: rowTrigger("projects-actions"),
        advance: "click",
        optional: true,
      },
      {
        section: "projects",
        title: "Открыть команду",
        text: "Выберите «Посмотреть команду», чтобы открыть состав из списка.",
        target: [
          rowAction("Действия проекта: ", "Посмотреть команду"),
          rowAction("Действия решения: ", "Посмотреть команду"),
        ].join(", "),
        advance: "click",
        optional: true,
      },
      {
        section: "projects",
        title: "Состав команды",
        text: "Здесь видны участники и их роли в команде. В заявке также отображаются приглашения, которые еще ожидают подтверждения, если они есть.",
        target: anchor("projects-team-panel"),
        optional: true,
      },
    ],
  },
  {
    id: "evaluation-v1",
    title: "Оценивание",
    description: "Критерии, эксперты, распределение и результаты",
    requiredTab: "evaluation",
    steps: [
      {
        section: "settings",
        tab: "criteria",
        title: "Критерии",
        text: "Настройте критерии до первой оценки.",
        target: anchor("evaluation-criteria"),
      },
      {
        section: "experts",
        title: "Эксперты",
        text: "Пригласите экспертов и укажите в их меню, какие кейсы оценит каждый.",
        target: anchor("evaluation-experts"),
      },
      {
        section: "results",
        title: "Результаты",
        text: "Откройте проект или решение, чтобы увидеть оценки экспертов.",
        target: anchor("evaluation-results"),
      },
      {
        section: "projects",
        tab: "allocation",
        title: "Распределение",
        text: "Нажмите «Распределить». В открывшемся окне можно проверить квоту и выбрать способ назначения.",
        target: anchor("allocation-start"),
        advance: "click",
      },
      {
        section: "projects",
        tab: "allocation",
        title: "Квота",
        text: "Укажите, сколько экспертов должны оценить каждый проект или решение. Перед сохранением можно проверить, как изменится число полностью оцененных работ.",
        target: anchor("allocation-quota"),
        optional: true,
      },
      {
        section: "projects",
        tab: "allocation",
        title: "Ручное назначение",
        text: "Для ручного назначения перейдите к проектам и выберите проекты одного кейса. Если программа принимает решения, кнопка «К экспертам» ведет к списку, где решения назначаются через меню эксперта.",
        target: anchor("allocation-manual"),
        optional: true,
      },
      {
        section: "projects",
        tab: "allocation",
        title: "Автоматическое распределение",
        text: "Нажмите «Распределить автоматически», чтобы начать подбор. Назначения можно проверить перед подтверждением. При наличии изменений квоты сначала сохраните или сбросьте их.",
        target: anchor("allocation-auto"),
        advance: "click",
        optional: true,
      },
      {
        section: "projects",
        tab: "allocation",
        title: "Проверка назначений",
        text: "Выберите экспертов, которые могут участвовать в распределении, и нажмите «Проверить назначения».",
        target: anchor("allocation-review"),
        advance: "click",
        optional: true,
      },
      {
        section: "projects",
        tab: "allocation",
        title: "Предпросмотр распределения",
        text: "Проверьте будущие назначения и нагрузку экспертов. Подтверждайте, когда список готов.",
        target: anchor("allocation-preview"),
        optional: true,
      },
    ],
  },
  {
    id: "settings-v1",
    title: "Настройки",
    description: "Страница · сроки · анкеты",
    requiredTab: "settings",
    steps: [
      {
        section: "settings",
        tab: "basic",
        title: "Страница",
        text: "Заполните информацию, которую увидят участники.",
        target: anchor("settings-page"),
      },
      {
        section: "settings",
        tab: "dates",
        title: "Сроки",
        text: "Укажите даты программы и регистрации.",
        target: anchor("settings-dates"),
      },
      {
        section: "settings",
        tab: "registration",
        title: "Регистрация",
        text: "Настройте вопросы для участников при регистрации.",
        target: anchor("settings-registration"),
      },
      {
        section: "settings",
        tab: "project-form",
        title: "Заявка проекта",
        text: "Настройте поля, которые заполнит команда проекта.",
        target: anchor("settings-project-form"),
      },
      {
        section: "settings",
        tab: "materials",
        title: "Материалы",
        text: "Добавьте документы и ссылки для участников.",
        target: anchor("settings-materials"),
      },
      {
        section: "settings",
        tab: "organizers",
        title: "Организаторы",
        text: "Пригласите коллег к управлению программой.",
        target: anchor("settings-organizers"),
      },
    ],
  },
  {
    id: "analytics-v1",
    title: "Аналитика",
    description: "Показатели · воронки · выгрузка",
    publishedOnly: true,
    steps: [
      {
        section: "analytics",
        title: "Показатели",
        text: "Посмотрите показатели участников и проектов программы.",
        target: anchor("analytics-summary"),
      },
      {
        section: "analytics",
        title: "Требует внимания",
        text: "Нажмите на число больше нуля, чтобы открыть список.",
        target: anchor("analytics-attention"),
      },
      {
        section: "analytics",
        title: "Воронки и динамика",
        text: "Сравните этапы участия и активность за 30 дней.",
        target: anchor("analytics-funnels"),
      },
      {
        section: "analytics",
        title: "Выгрузка",
        text: "Скачайте данные программы через кнопку выгрузки.",
        target: anchor("analytics-export"),
      },
    ],
  },
  {
    id: "certificates-v1",
    title: "Сертификаты",
    description: "Шаблон, правила выдачи и журнал",
    steps: [
      {
        section: "participants",
        title: "Где открыть сертификаты",
        text: "Кнопка «Сертификаты» находится над списком участников.",
        target: anchor("certificates-entry"),
      },
      {
        section: "certificates",
        title: "Шаблон",
        text: "Нажмите «Шаблон», чтобы открыть редактор сертификата.",
        target: anchor("certificate-tab-1"),
        advance: "click",
      },
      {
        section: "certificates",
        title: "Редактор сертификата",
        text: "Настройте фон и поля, проверьте результат в предпросмотре или скачайте пробный PDF. Сохраните шаблон перед выдачей.",
        target: anchor("certificate-template"),
      },
      {
        section: "certificates",
        title: "Выдача",
        text: "Откройте вкладку «Выдача», чтобы настроить правила.",
        target: anchor("certificate-tab-2"),
        advance: "click",
      },
      {
        section: "certificates",
        title: "Кому выдать",
        text: "Выберите получателей и проверьте, сколько участников соответствует условиям.",
        target: anchor("certificate-audience"),
      },
      {
        section: "certificates",
        title: "Когда выдать",
        text: "Настройте время выдачи.",
        target: anchor("certificate-timing"),
      },
      {
        section: "certificates",
        title: "Как выдать",
        text: "Выберите, нужно ли отправлять сертификаты по почте. Проверьте настройки и запускайте выдачу, когда все готово.",
        target: anchor("certificate-channel"),
      },
      {
        section: "certificates",
        title: "Журнал",
        text: "Откройте «Журнал», чтобы проверить результаты выдачи.",
        target: anchor("certificate-tab-3"),
        advance: "click",
      },
      {
        section: "certificates",
        title: "Результаты выдачи",
        text: "Посмотрите, сколько PDF готово, сколько писем отправлено и где возникли ошибки. Найдите получателя по имени или почте.",
        target: anchor("certificate-journal"),
      },
    ],
  },
];

export const PROGRAM_CONTEXT_GUIDES: readonly ProgramGuide[] = [
  {
    id: "participant-removal-v1",
    title: "Проверка перед удалением",
    description: "Регистрации, команды и заявки",
    steps: [
      {
        section: "participants",
        title: "Проверьте последствия удаления",
        text: "Сверьте регистрации, изменения состава команд и заявки руководителей, которые перестанут участвовать в оценивании. Аккаунты на платформе сохранятся. Чтобы оставить данные программы без изменений, нажмите «Отмена».",
        target: anchor("participant-removal-v1"),
      },
    ],
  },
  {
    id: "allocation-shortage-v1",
    title: "Не хватает экспертов",
    description: "Проверка доступных кандидатов",
    steps: [
      {
        section: "projects",
        tab: "allocation",
        title: "Не хватает экспертов",
        text: "Посмотрите, каким работам не хватает назначений. Уточните список экспертов и их кейсы или пригласите дополнительных экспертов. Затем проверьте распределение еще раз.",
        target: anchor("allocation-shortage-v1"),
      },
    ],
  },
];
