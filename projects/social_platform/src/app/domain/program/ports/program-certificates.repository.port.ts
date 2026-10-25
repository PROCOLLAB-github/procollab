/** @format */
import { Observable } from "rxjs";
import {
  CertificateAsset,
  CertificateDraft,
  CertificateFilter,
  CertificateJournal,
  CertificateSettings,
  CertificateSelection,
} from "../program-certificates.model";
export abstract class ProgramCertificatesRepositoryPort {
  abstract settings(id: number): Observable<CertificateSettings>;
  abstract save(
    id: number,
    revision: number,
    draft: CertificateDraft,
  ): Observable<CertificateSettings>;
  abstract upload(
    id: number,
    kind: "background" | "signature",
    file: File,
  ): Observable<CertificateAsset>;
  abstract asset(id: number, assetId: number): Observable<Blob>;
  abstract preview(id: number, revision: number, longName?: boolean): Observable<Blob>;
  abstract test(id: number, revision: number): Observable<{ detail: string }>;
  abstract activate(id: number, revision: number): Observable<CertificateSettings>;
  abstract queue(id: number, action: "pause" | "resume"): Observable<CertificateSettings>;
  abstract journal(
    id: number,
    status: CertificateFilter,
    search: string,
    offset: number,
  ): Observable<CertificateJournal>;
  abstract retry(id: number, ids?: string[]): Observable<{ count: number }>;
  abstract pdf(id: number, certificateId: string): Observable<Blob>;
  abstract currentPdf(id: number, certificateId: string, revision: number): Observable<Blob>;
  abstract selection(
    id: number,
    revision: number,
    action: "send" | "refresh" | "retry",
    selection: CertificateSelection,
  ): Observable<{ count: number; skipped: number }>;
  abstract archive(id: number, status: CertificateFilter, search: string): Observable<Blob>;
  abstract currentArchive(
    id: number,
    revision: number,
    selection: CertificateSelection,
  ): Observable<Blob>;
  abstract mine(id: number): Observable<{ id: string; issuedAt: string; url: string }[]>;
}
