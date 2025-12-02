/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { Board } from "../models/board.model";

@Injectable({ providedIn: "root" })
export class KanbanBoardInfoService {
  readonly boardInfo = signal<Board | null>({
    id: 1,
    name: "123",
    description:
      "bhbhhbhbbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhhbbhbhhbbhbhbhhbbhbhbhbhbhbhbhhbhbhbbhbhbhbhhbbhhbbhbhbhbhhbhbbhbhbhbhhbhbbhbhbhhbbhhbhbhbhbhbhbbhbhhbbhhbhbhbbhbhhbbhbhbhbhbhbhbhbhbhhbbhbhbhbhbhbhhb",
    color: "accent",
    icon: "task",
  });

  readonly boards = signal<Board[] | null>([
    {
      id: 1,
      name: "123",
      description:
        "bhbhhbhbbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhbhhbbhbhhbbhbhbhhbbhbhbhbhbhbhbhhbhbhbbhbhbhbhhbbhhbbhbhbhbhhbhbbhbhbhbhhbhbbhbhbhhbbhhbhbhbhbhbhbbhbhhbbhhbhbhbbhbhhbbhbhbhbhbhbhbhbhbhhbbhbhbhbhbhbhhb",
      color: "accent",
      icon: "task",
    },
    {
      id: 2,
      name: "456",
      description: "kklmklmsklmcslkmcdskmcdslkcdslkmcdsklmscklmcdsklmsdc",
      color: "blue-dark",
      icon: "command",
    },
  ]);

  readonly selectedBoardId = signal<number>(0);

  setBoardInProject(board: Board): void {
    this.boardInfo.set(board);
  }

  setBoardsInProject(boards: Board[]): void {
    this.boards.set(boards);
  }

  setSelectedBoard(id: number) {
    this.selectedBoardId.set(id);
  }

  isFirstBoard = computed(() => {
    const id = this.selectedBoardId();
    const boards = this.boards();

    if (!boards || id === null) return false;

    const index = boards.findIndex(board => board.id === id);
    return index === 0;
  });
}
