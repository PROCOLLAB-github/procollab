/** @format */

export interface Skill {
  fileLink: string;
  id: number;
  name: string;
  quantityOfLevels: number;
  whoCreated: string;
}

export interface SkillDetail {
  skillName: string;
  description: string;
  level: number;
  file: string;
}
export interface TaskDetail {
  skillName: string;
  description: string;
  level: number;
  file: string;
}

export interface Task {
  id: number;
  level: number;
  name: string;
  status: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  progress: number;
}

export interface TaskStep {
  id: number;
  isDone: boolean;
  type: "exclude_question" | "question_single_answer" | "question_connect" | "info_slide";
  ordinalNumber: number;
}

export interface TaskStepsResponse extends TaskDetail {
  count: number;
  stepData: TaskStep[];
}

export interface InfoSlide {
  text: string;
  files: string[];
}

export interface ConnectQuestion {
  connectLeft: { id: number; text: string }[];
  connectRight: { id: number; text: string }[];
  description: string;
  files: string[];
  id: number;
  isAnswered: boolean;
  questionText: string;
}
export interface SingleQuestion {
  answers: { id: number; text: string }[];
  description: string;
  files: string[];
  id: number;
  isAnswered: boolean;
  questionText: string;
}
export interface ExcludeQuestion {
  answers: { id: number; text: string }[];
  description: string;
  files: string[];
  id: number;
  isAnswered: boolean;
  questionText: string;
}

export type StepType = InfoSlide | ConnectQuestion | SingleQuestion | ExcludeQuestion;
