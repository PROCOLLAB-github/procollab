/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject, map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TrajectoriesService {
  constructor(private readonly apiService: ApiService) {}

  trajectories = new BehaviorSubject([
    {
      title: "Старт в карьеру",
      description:
        "Четырехмесячный интенсив, в котором ты поймешь азы карьерного планирования. С опытным наставником, ты разберешь свои сильные стороны, проработаешь барьеры на пути к успешной карьере. ",
      seat: "ряд 43, место А320",
      termDate: "4 месяца + 2 встречи с наставником",
      skills: [
        {
          id: 1,
          label: "Создание CV1",
        },
        {
          id: 2,
          label: "Создание CV2",
        },
        {
          id: 3,
          label: "Создание CV3",
        },
        {
          id: 4,
          label: "Создание CV4",
        },
        {
          id: 5,
          label: "Создание CV5",
        },
      ],
    },
  ]);

  getTrajectories(limit: number, offset: number) {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.trajectories;
  }

  getOne(id: number) {
    return this.trajectories.pipe(
      map((trajectories: any) => trajectories.skills.find((t: any) => t.id === id))
    );
  }
}
