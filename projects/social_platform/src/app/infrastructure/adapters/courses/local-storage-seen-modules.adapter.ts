/** @format */

import { Injectable } from "@angular/core";
import { SeenModulesStoragePort } from "@domain/courses/ports/seen-modules-storage.port";

@Injectable({ providedIn: "root" })
export class LocalStorageSeenModulesAdapter implements SeenModulesStoragePort {
  isSeen(courseId: number, moduleId: number): boolean {
    return localStorage.getItem(this.key(courseId, moduleId)) !== null;
  }

  markSeen(courseId: number, moduleId: number): void {
    localStorage.setItem(this.key(courseId, moduleId), "true");
  }

  private key(courseId: number, moduleId: number): string {
    return `course_${courseId}_module_${moduleId}_complete_seen`;
  }
}
