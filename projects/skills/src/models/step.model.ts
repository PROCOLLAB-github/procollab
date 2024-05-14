/** @format */

export type ConnectQuestionRequest = { leftId: number; rightId: number }[];
export type ConnectQuestionResponse = {
  leftId: number;
  rightId: number;
  isCorrect: boolean;
}[];
