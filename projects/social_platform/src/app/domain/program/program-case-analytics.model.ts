/** @format */
import { ProgramAnalyticsCaseMetrics, ProgramAnalyticsError } from "./program-analytics.model";

export type ProgramCaseSelection =
  | { scope: "selected"; caseName: string }
  | { scope: "all"; caseName?: never }
  | { scope: "without_case"; caseName?: never };
export interface ProgramCaseQuery {
  selection: ProgramCaseSelection;
  search?: string;
  limit?: number;
  offset?: number;
}
export interface ProgramCaseProject {
  programProjectId: number;
  project: { id: number; name: string; region: string | null; presentationAddress: string | null };
  case: { kind: "selected" | "without_case"; name: string | null };
  leader: { userId: number; fullName: string } | null;
  teamSize: number;
  linkedAt: string;
  submitted: boolean;
  submittedAt: string | null;
}
export interface ProgramCasePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProgramCaseProject[];
  selection: { scope: ProgramCaseSelection["scope"]; caseName: string | null };
  casesConfigured: boolean;
  submissionApplicable: boolean;
  caseMetrics: ProgramAnalyticsCaseMetrics | null;
}
export interface ProgramCaseError {
  kind: ProgramAnalyticsError["kind"] | "unsupported" | "invalid";
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const count = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const textOrNull = (value: unknown): boolean => value === null || typeof value === "string";

/** Старый backend игнорирует view: проверяем структуру и идентичность bucket, а не только HTTP 200. */
export function isProgramCasePage(
  value: unknown,
  selection: ProgramCaseSelection,
): value is ProgramCasePage {
  if (
    !record(value) ||
    !record(value["selection"]) ||
    value["selection"]["scope"] !== selection["scope"] ||
    value["selection"]["caseName"] !==
      (selection["scope"] === "selected" ? selection["caseName"] : null) ||
    typeof value["casesConfigured"] !== "boolean" ||
    typeof value["submissionApplicable"] !== "boolean" ||
    !count(value["count"]) ||
    !textOrNull(value["next"]) ||
    !textOrNull(value["previous"]) ||
    !Array.isArray(value["results"])
  )
    return false;
  const metrics = value["caseMetrics"];
  if (
    selection["scope"] === "all"
      ? metrics !== null
      : !record(metrics) ||
        !["projectsTotal", "participantsTotal", "submitted", "notSubmitted"].every(key =>
          count(metrics[key]),
        )
  )
    return false;
  return value["results"].every(row => {
    if (!record(row) || !record(row["project"]) || !record(row["case"])) return false;
    const bucket = row["case"];
    return (
      count(row["programProjectId"]) &&
      row["programProjectId"] > 0 &&
      count(row["project"]["id"]) &&
      row["project"]["id"] > 0 &&
      typeof row["project"]["name"] === "string" &&
      textOrNull(row["project"]["presentationAddress"]) &&
      textOrNull(row["project"]["region"]) &&
      ((bucket["kind"] === "without_case" && bucket["name"] === null) ||
        (bucket["kind"] === "selected" && typeof bucket["name"] === "string")) &&
      (selection["scope"] === "all" ||
        (bucket["kind"] === selection["scope"] &&
          bucket["name"] === (selection["scope"] === "selected" ? selection["caseName"] : null))) &&
      (row["leader"] === null ||
        (record(row["leader"]) &&
          count(row["leader"]["userId"]) &&
          typeof row["leader"]["fullName"] === "string")) &&
      count(row["teamSize"]) &&
      typeof row["linkedAt"] === "string" &&
      typeof row["submitted"] === "boolean" &&
      textOrNull(row["submittedAt"])
    );
  });
}
