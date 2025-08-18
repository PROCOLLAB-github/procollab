<!-- @format -->

# Core Library Documentation

Основная библиотека Angular приложения, содержащая общие сервисы, модели, пайпы, интерцепторы и константы.

## Структура проекта

src/
├── consts/ # Константы и списки данных
├── environments/ # Конфигурация окружения
├── lib/
│ ├── interceptors/ # HTTP интерцепторы
│ ├── models/ # Модели данных
│ ├── pipes/ # Пайпы для трансформации данных
│ ├── providers/ # Провайдеры и токены
│ └── services/ # Сервисы
└── public-api.ts # Публичный API модуля

## Основные компоненты

### 🔧 Сервисы (Services)

#### ApiService

Базовый сервис для работы с HTTP API.

**Методы:**

- `get<T>(path, params?, options?)` - GET запрос
- `post<T>(path, body)` - POST запрос
- `put<T>(path, body)` - PUT запрос
- `patch<T>(path, body)` - PATCH запрос
- `delete<T>(path, params?)` - DELETE запрос

#### SkillsApiService

Расширенный API сервис для работы с Skills API.

#### TokenService

Управление JWT токенами аутентификации.

**Методы:**

- `getTokens()` - Получить токены из cookies
- `memTokens(tokens)` - Сохранить токены в cookies
- `clearTokens()` - Очистить токены
- `refreshTokens()` - Обновить токены

#### ValidationService

Сервис для валидации форм.

**Валидаторы:**

- `useMatchValidator(left, right)` - Проверка совпадения полей
- `useDateFormatValidator()` - Валидация формата даты
- `useAgeValidator(age)` - Проверка возраста
- `useLanguageValidator()` - Проверка русского языка
- `getFormValidation(form)` - Валидация всей формы

#### YtExtractService

Извлечение и обработка YouTube ссылок.

#### SubscriptionPlansService

Управление подписками пользователей.

### 🔄 Интерцепторы (Interceptors)

#### BearerTokenInterceptor

Автоматически добавляет Bearer токен к HTTP запросам и обрабатывает обновление токенов при 401 ошибке.

#### CamelcaseInterceptor

Преобразует snake_case в camelCase для запросов и ответов API.

### 🔧 Пайпы (Pipes)

#### Валидация форм

- `ControlErrorPipe` - Проверка ошибок в контролах форм
- `FormControlPipe` - Приведение AbstractControl к FormControl

#### Работа с датами

- `DayjsPipe` - Форматирование дат с помощью dayjs
- `YearsFromBirthdayPipe` - Вычисление возраста по дате рождения

#### Форматирование текста

- `ParseBreaksPipe` - Замена \n на <br>
- `ParseLinksPipe` - Преобразование ссылок в кликабельные
- `CapitalizePipe` - Капитализация первой буквы
- `PluralizePipe` - Склонение слов по числам (русский язык)

#### Трансформация данных

- `SalaryTransformPipe` - Форматирование зарплаты
- `LinkTransformPipe` - Извлечение домена из ссылки

### 🎯 Провайдеры (Providers)

#### API_URL

Токен для инъекции базового URL API.

#### SKILLS_API_URL

Токен для инъекции URL Skills API.

#### PRODUCTION

Токен для определения production окружения.

### 📋 Константы (Constants)

#### Навигация

- `navProjectItems` - Элементы навигации для проектов
- `navProfileItems` - Элементы навигации для профиля

#### Списки данных

- `directionProjectList` - Направления проектов
- `trackProjectList` - Треки проектов
- `experienceList` - Уровни опыта
- `formatList` - Форматы работы
- `scheludeList` - Графики работы
- `rolesMembersList` - Роли участников
- `languageNamesList` - Названия языков
- `languageLevelsList` - Уровни языков
- `educationUserType` - Типы образования
- `educationUserLevel` - Уровни образования
- `yearList` - Список годов
- `ratingFiltersList` - Фильтры рейтинга
- `filterTags` - Теги фильтров

#### Профиль

- `fieldsProfile` - Поля профиля пользователя
- `trajectoryMore` - Дополнительная информация о траектории

## Использование

### Настройка провайдеров

\`\`\`typescript
providers: [
{ provide: API_URL, useValue: 'https://api.example.com' },
{ provide: SKILLS_API_URL, useValue: 'https://skills-api.example.com' },
{ provide: PRODUCTION, useValue: environment.production }
]
\`\`\`

### Примеры использования

#### Работа с API

\`\`\`typescript
constructor(private apiService: ApiService) {}

loadData() {
return this.apiService.get<User[]>('/users');
}
\`\`\`

#### Валидация форм

\`\`\`typescript
constructor(private validationService: ValidationService) {}

createForm() {
return this.fb.group({
password: ['', Validators.required],
confirmPassword: ['', Validators.required]
}, {
validators: this.validationService.useMatchValidator('password', 'confirmPassword')
});
}
\`\`\`

#### Использование пайпов в шаблонах

\`\`\`html

<!-- Проверка ошибок -->
<div *ngIf="form.get('email') | controlError">
  Поле обязательно для заполнения
</div>

<!-- Форматирование даты -->

<span>{{ user.createdAt | dayjs:'format':'DD.MM.YYYY' }}</span>

<!-- Склонение слов -->

<span>{{ count }} {{ count | pluralize:['проект', 'проекта', 'проектов'] }}</span>
\`\`\`

## Зависимости

- `@angular/core`
- `@angular/common/http`
- `@angular/forms`
- `dayjs` - Работа с датами
- `js-cookie` - Управление cookies
- `class-transformer` - Трансформация объектов
- `linkify-string` - Обработка ссылок
- `snakecase-keys` - Преобразование ключей в snake_case
- `camelcase-keys` - Преобразование ключей в camelCase

## Тестирование

Все сервисы и пайпы покрыты unit тестами с использованием Jasmine и Karma.

Запуск тестов:
\`\`\`bash
ng test core
\`\`\`

## Сборка

Для сборки библиотеки:
\`\`\`bash
ng build core
\`\`\`

Для production сборки:
\`\`\`bash
ng build core --configuration production
