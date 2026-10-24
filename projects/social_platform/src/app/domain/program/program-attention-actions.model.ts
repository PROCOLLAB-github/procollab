/** @format */
export type ProgramAttentionCategory =
  "participants-without-visit" | "participants-without-team" | "projects-awaiting-evaluation";

export interface ProgramAttentionSelection {
  mode: "selected" | "all";
  ids: number[];
  excludedIds: number[];
}

export interface ProgramAttentionActionQuery {
  search: string;
  selection: ProgramAttentionSelection;
}

export interface ProgramAttentionPreview {
  token: string | null;
  selectedCount: number;
  recipientCount: number;
  withoutAssignmentsCount: number;
  unavailableCount: number;
  previewText: string;
  recipients: { userId: number; fullName: string }[];
  expiresIn: number;
}

export interface ProgramAttentionSendResult {
  createdCount: number;
  skippedCount: number;
}

export interface ProgramAttentionActionError {
  kind: "unauthorized" | "forbidden" | "not_found" | "validation" | "network";
}
