/** @format */
export type CertificateElement =
  | "title"
  | "subtitle"
  | "name"
  | "program"
  | "date"
  | "number"
  | "director"
  | "position"
  | "signature";
export interface CertificateBox {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}
export interface CertificateAsset {
  id: number;
  name: string;
  width: number;
  height: number;
}
export interface CertificateDraft {
  backgroundId: number | null;
  signatureId: number | null;
  director: string;
  position: string;
  showText: boolean;
  audience: "all" | "submitted";
  timing: "manual" | "scheduled";
  scheduledAt: string | null;
  sendEmail: boolean;
  subject: string;
  message: string;
  layout: Record<CertificateElement, CertificateBox>;
}
export interface CertificateSettings {
  revision: number;
  draft: CertificateDraft;
  assets: { background: CertificateAsset | null; signature: CertificateAsset | null };
  eligibleCounts: { all: number; submitted: number };
  batch: { id: number; active: boolean; issueAt: string; initializedAt: string | null } | null;
}
export type CertificateFilter = "all" | "sent" | "failed";
export interface CertificateDelivery {
  id: string;
  name: string;
  email: string;
  status: "pending" | "generating" | "sending" | "sent" | "failed" | "ready";
  pdfReady: boolean;
  error: string;
  sentAt: string | null;
}
export interface CertificateJournal {
  count: number;
  results: CertificateDelivery[];
  summary: { total: number; ready: number; sent: number; failed: number };
}
