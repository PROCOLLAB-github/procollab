/** @format */

export interface Skill {
  id: number;
  name: string;
  quantityOfLevels: number;
  fileLink: string;
  whoCreated: string;
  description: string;
  isFromTrajectory: boolean;
  requiresSubscription: boolean;
  isDone: boolean;
  freeAccess: boolean;
  overdue?: boolean;
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
  statsOfWeeks: {
    doneOnTime: boolean | null;
    isDone: boolean;
    week: number;
  }[];
  progress: number;
}

export interface TaskStep {
  id: number;
  isDone: boolean;
  type:
    | "exclude_question"
    | "question_single_answer"
    | "question_connect"
    | "info_slide"
    | "question_write";
  ordinalNumber: number;
}

export interface TaskStepsResponse extends TaskDetail {
  count: number;
  currentLevel: number;
  nextLevel: number;
  skillName: string;
  skillPointLogo: string;
  skillPreview: string;
  stepData: TaskStep[];
}

export interface TaskResults {
  pointsGained: number;
  quantityDoneCorrect: number;
  quantityAll: number;
  progress: number;
  nextTaskId: null | number;
  level: number;
  skillName: string;
}
