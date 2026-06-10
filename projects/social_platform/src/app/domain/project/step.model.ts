/** @format */

/** Base interface for all step types */
interface BaseStep {
  id: number; // Unique identifier for the step
}

/** Всплывающее окно с дополнительной информацией */
export interface Popup {
  title: string | null; // Заголовок всплывающего окна
  text: string | null; // Текстовое содержимое
  fileLink: string | null; // URL к связанному файлу или ресурсу
  ordinalNumber: number; // Порядковый номер для сортировки
}

/** Информационный слайд */
export interface InfoSlide extends BaseStep {
  text: string; // Основной текстовый контент слайда
  description: string; // Дополнительное описание или контекст
  files: string[]; // Массив URL файлов для отображения (изображения, документы)
  popups: Popup[]; // Всплывающие окна для отображения после просмотра
  videoUrl?: string; // Ссылка для видео
}

/** Вопрос на соединение */
export interface ConnectQuestion extends BaseStep {
  connectLeft: { id: number; text?: string; file?: string }[]; // Элементы левой колонки
  connectRight: { id: number; text?: string; file?: string }[]; // Элементы правой колонки
  description: string; // Инструкции по выполнению сопоставления
  files: string[]; // Дополнительные файлы для контекста
  isAnswered: boolean; // Был ли вопрос уже отвечен
  text: string; // Основной текст вопроса
  popups: Popup[]; // Всплывающие окна для отображения после ответа
}

/** Структура запроса для вопросов на соединение */
export type ConnectQuestionRequest = { leftId: number; rightId: number }[];

/** Структура ответа для вопросов на соединение */
export type ConnectQuestionResponse = {
  leftId: number;
  rightId: number;
  isCorrect: boolean; // Правильно ли это соединение
}[];

/** Вопрос с единственным правильным ответом */
export interface SingleQuestion extends BaseStep {
  answers: { id: number; text: string }[]; // Доступные варианты ответов
  description: string; // Дополнительное описание или контекст
  files: string[]; // Связанные файлы (изображения, документы)
  isAnswered: boolean; // Был ли вопрос уже отвечен
  text: string; // Основной текст вопроса
  popups: Popup[]; // Всплывающие окна для отображения после ответа
  videoUrl: string;
}

/** Ответ об ошибке для вопросов с единственным ответом */
export interface SingleQuestionError {
  correctAnswer: number; // ID правильного варианта
  isCorrect: boolean; // Был ли ответ правильным (всегда false для ошибок)
}

/** Вопрос на исключение */
export interface ExcludeQuestion extends BaseStep {
  answers: { id: number; text: string }[]; // Элементы для рассмотрения
  description: string; // Инструкции для задачи исключения
  files: string[]; // Связанные файлы для контекста
  isAnswered: boolean; // Был ли вопрос уже отвечен
  text: string; // Основной текст вопроса
  popups: Popup[]; // Всплывающие окна для отображения после ответа
}

/** Структура ответа для вопросов на исключение */
export interface ExcludeQuestionResponse {
  isCorrect: boolean; // Был ли ответ пользователя правильным
  wrongAnswers: number[]; // ID неправильно выбранных элементов
}

/** Вопрос с письменным ответом */
export interface WriteQuestion extends BaseStep {
  answer: string | null; // Текущий ответ пользователя (если есть)
  description: string; // Инструкции или дополнительный контекст
  files: string[]; // Связанные файлы для справки
  text: string; // Основной текст вопроса или подсказка
  popups: Popup[]; // Всплывающие окна для отображения после отправки
}

/** Объединенный тип всех возможных типов шагов */
export type StepType =
  | InfoSlide
  | ConnectQuestion
  | SingleQuestion
  | ExcludeQuestion
  | WriteQuestion;
