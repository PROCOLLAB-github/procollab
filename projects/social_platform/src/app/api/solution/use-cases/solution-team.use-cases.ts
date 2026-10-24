/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionInvitationQuery,
  SolutionRepositoryPort,
} from "@domain/solution/ports/solution.repository.port";
import {
  SolutionCaptainCommand,
  SolutionTeamCommand,
  SolutionCreateInvitation,
  SolutionUpdateInvitation,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class RemoveSolutionMemberUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, userId: number, version: number) {
    return solutionRequestResult(() =>
      this.repository.removeMember(programId, solutionId, userId, version),
    );
  }
}
@Injectable({ providedIn: "root" })
export class LeaveSolutionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SolutionTeamCommand) {
    return solutionRequestResult(() => this.repository.leave(programId, solutionId, command));
  }
}
@Injectable({ providedIn: "root" })
export class TransferSolutionCaptainUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SolutionCaptainCommand) {
    return solutionRequestResult(() =>
      this.repository.transferCaptain(programId, solutionId, command),
    );
  }
}
@Injectable({ providedIn: "root" })
export class GetSolutionInvitationsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, query?: SolutionInvitationQuery) {
    return solutionRequestResult(() => this.repository.invitations(programId, solutionId, query));
  }
}
@Injectable({ providedIn: "root" })
export class CreateSolutionInvitationUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SolutionCreateInvitation) {
    return solutionRequestResult(() =>
      this.repository.createInvitation(programId, solutionId, command),
    );
  }
}
@Injectable({ providedIn: "root" })
export class GetMySolutionInvitationsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(query?: SolutionInvitationQuery) {
    return solutionRequestResult(() => this.repository.myInvitations(query));
  }
}
@Injectable({ providedIn: "root" })
export class GetSolutionInvitationUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(invitationId: number) {
    return solutionRequestResult(() => this.repository.invitation(invitationId));
  }
}
@Injectable({ providedIn: "root" })
export class UpdateSolutionInvitationUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(invitationId: number, command: SolutionUpdateInvitation) {
    return solutionRequestResult(() => this.repository.updateInvitation(invitationId, command));
  }
}
@Injectable({ providedIn: "root" })
export class RevokeSolutionInvitationUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(invitationId: number, version: number, solutionVersion: number) {
    return solutionRequestResult(() =>
      this.repository.revokeInvitation(invitationId, version, solutionVersion),
    );
  }
}
@Injectable({ providedIn: "root" })
export class DecideSolutionInvitationUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(invitationId: number, decision: "accept" | "decline", version: number) {
    return solutionRequestResult(() =>
      this.repository.decideInvitation(invitationId, decision, version),
    );
  }
}
