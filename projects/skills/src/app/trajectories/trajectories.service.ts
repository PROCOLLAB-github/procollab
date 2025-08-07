/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { catchError, map, of } from "rxjs";
import { Student, Trajectory, UserTrajectory } from "../../models/trajectory.model";

/**
 * Сервис траекторий
 *
 * Управляет всеми операциями, связанными с траекториями, включая:
 * - Обнаружение траекторий и регистрацию
 * - Отслеживание прогресса пользователя по траектории
 * - Управление отношениями ментор-студент
 * - Индивидуальные назначения навыков
 * - Обновления статуса встреч
 *
 * Траектории представляют структурированные пути обучения, которые направляют пользователей
 * через серию навыков и этапов для достижения карьерных целей.
 */
@Injectable({
  providedIn: "root",
})
export class TrajectoriesService {
  private readonly TRAJECTORY_URL = "/trajectories";

  constructor(private readonly apiService: SkillsApiService) {}

  /**
   * Получает доступные траектории с пагинацией
   *
   * @param limit - Количество траекторий для получения на страницу
   * @param offset - Количество траекторий для пропуска для пагинации
   * @returns Observable<Trajectory[]> - Список доступных траекторий
   */
  getTrajectories(limit: number, offset: number) {
    const params = new HttpParams();
    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService.get<Trajectory[]>(this.TRAJECTORY_URL);
  }

  /**
   * Получает траекторию, в которой текущий пользователь активно зарегистрирован
   *
   * @returns Observable<Trajectory[]> - Массив, содержащий активную траекторию пользователя (если есть)
   */
  getMyTrajectory() {
    return this.apiService.get<Trajectory[]>(this.TRAJECTORY_URL).pipe(
      map(track => {
        const choosedTrajctory = track.find(trajectory => trajectory.isActiveForUser === true);
        return [choosedTrajctory];
      })
    );
  }

  /**
   * Получает подробную информацию о конкретной траектории
   *
   * @param id - Уникальный идентификатор траектории
   * @returns Observable<Trajectory> - Полная информация о траектории
   */
  getOne(id: number) {
    return this.apiService.get<Trajectory>(`${this.TRAJECTORY_URL}/${id}`);
  }

  /**
   * Получает информацию о регистрации текущего пользователя в траектории
   *
   * Включает прогресс, назначение ментора, статус встреч и категоризацию навыков.
   *
   * @returns Observable<UserTrajectory> - Полные данные регистрации пользователя в траектории
   */
  getUserTrajectoryInfo() {
    return this.apiService.get<UserTrajectory>(`${this.TRAJECTORY_URL}/user-trajectory/`);
  }

  /**
   * Получает всех студентов, назначенных текущему ментору
   *
   * Используется менторами для просмотра и управления прогрессом назначенных им студентов.
   *
   * @returns Observable<Student[]> - Список студентов с их прогрессом по траектории
   */
  getMentorStudents() {
    return this.apiService.get<Student[]>(`${this.TRAJECTORY_URL}/mentor/students/`);
  }

  /**
   * Получает индивидуальные навыки, назначенные специально текущему пользователю
   *
   * Индивидуальные навыки - это пользовательские назначения, которые могут не быть частью
   * стандартной учебной программы траектории.
   *
   * @returns Observable<Skill[]> - Список индивидуально назначенных навыков
   */
  getIndividualSkills() {
    return this.apiService
      .get<UserTrajectory["individualSkills"][] | any>(`${this.TRAJECTORY_URL}/individual-skills/`)
      .pipe(
        map(response => {
          // Обработка различных форматов ответов от API
          if (Array.isArray(response) && response.length > 0) {
            return response[0].skills || [];
          }
          return [];
        }),
        catchError(error => {
          console.log("Ошибка при получении индивидуальных навыков", error);
          return of([]); // Возвращает пустой массив при ошибке
        })
      );
  }

  /**
   * Обновляет статус встречи для отношений ментор-студент
   *
   * @param id - ID записи встречи
   * @param initialMeeting - Была ли завершена первоначальная встреча
   * @param finalMeeting - Была ли завершена финальная встреча
   * @returns Observable<any> - Ответ, подтверждающий обновление
   */
  updateMeetings(id: number, initialMeeting: boolean, finalMeeting: boolean) {
    const body = {
      meeting_id: id,
      initial_meeting: initialMeeting,
      final_meeting: finalMeeting,
    };

    return this.apiService.post<typeof body>(`${this.TRAJECTORY_URL}/meetings/update/`, body);
  }

  /**
   * Регистрирует текущего пользователя в конкретной траектории
   *
   * Создает новую регистрацию пользователя в траектории и назначает ментора.
   *
   * @param trajectoryId - ID траектории для регистрации
   * @returns Observable<any> - Ответ, подтверждающий регистрацию
   */
  activateTrajectory(trajectoryId: number) {
    return this.apiService.post(`${this.TRAJECTORY_URL}/user-trajectory/create/`, {
      trajectory_id: trajectoryId,
    });
  }
}
