/** @format */
import { inject, Injectable } from "@angular/core";
import { ProgramLaunchRepositoryPort } from "@domain/program/ports/program-launch.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { ProgramUpdated } from "@domain/program/program-updated.event";
import { tap } from "rxjs";
@Injectable()
export class ProgramLaunchUseCase {
  private readonly repository = inject(ProgramLaunchRepositoryPort);
  private readonly events = inject(EventBus);
  readonly capabilities = this.repository.capabilities.bind(this.repository);
  readonly create = this.repository.create.bind(this.repository);
  readonly managed = this.repository.managed.bind(this.repository);
  readonly readiness = this.repository.readiness.bind(this.repository);
  publish(id: number, revision: string) {
    return this.repository.publish(id, revision).pipe(
      tap(state => {
        if (!state.program.draft)
          this.events.emit<ProgramUpdated>({
            type: "ProgramUpdated",
            payload: { programId: id },
            occurredAt: new Date(),
          });
      }),
    );
  }
  readonly preview = this.repository.preview.bind(this.repository);
}
