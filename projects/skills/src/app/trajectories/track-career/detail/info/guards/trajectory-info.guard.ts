/** @format */

import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { inject } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { TrajectoriesService } from "../../../../trajectories.service";

export const TrajectoryInfoRequiredGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const trajectoriesService = inject(TrajectoriesService);

  const trajectoryId = Number(route.paramMap.get("trackId"));
  if (isNaN(trajectoryId)) {
    return of(router.createUrlTree(["/trackCar/all"]));
  }

  return trajectoriesService.getOne(trajectoryId).pipe(
    map(trajectory => {
      if (trajectory.isActiveForUser) {
        return true;
      }
      return router.createUrlTree(["/trackCar/all"]);
    }),
    catchError(() => {
      return of(router.createUrlTree(["/trackCar/all"]));
    })
  );
};
