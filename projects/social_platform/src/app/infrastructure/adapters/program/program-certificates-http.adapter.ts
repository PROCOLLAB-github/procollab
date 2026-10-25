/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { ProgramCertificatesRepositoryPort } from "@domain/program/ports/program-certificates.repository.port";
import {
  CertificateAsset,
  CertificateDraft,
  CertificateFilter,
  CertificateJournal,
  CertificateSettings,
  CertificateSelection,
} from "@domain/program/program-certificates.model";
@Injectable()
export class ProgramCertificatesHttpAdapter implements ProgramCertificatesRepositoryPort {
  private readonly api = inject(ApiService);
  private root(id: number) {
    return `/programs/${id}/management/certificates/`;
  }
  settings(id: number) {
    return this.api.get<CertificateSettings>(this.root(id));
  }
  save(id: number, revision: number, draft: CertificateDraft) {
    return this.api.put<CertificateSettings>(this.root(id), { revision, draft });
  }
  upload(id: number, kind: "background" | "signature", file: File) {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    return this.api.post<CertificateAsset>(this.root(id) + "assets/", body);
  }
  asset(id: number, assetId: number) {
    return this.api.getFile(this.root(id) + `assets/${assetId}/`);
  }
  preview(id: number, revision: number, longName = false) {
    return this.api.postFile(this.root(id) + "preview/", { revision, longName });
  }
  test(id: number, revision: number) {
    return this.api.post<{ detail: string }>(this.root(id) + "test/", { revision });
  }
  activate(id: number, revision: number) {
    return this.api.post<CertificateSettings>(this.root(id) + "activate/", { revision });
  }
  queue(id: number, action: "pause" | "resume") {
    return this.api.post<CertificateSettings>(this.root(id) + `queue/${action}/`, {});
  }
  private query(status: CertificateFilter, search: string) {
    return new HttpParams().set("status", status).set("search", search);
  }
  journal(id: number, status: CertificateFilter, search: string, offset: number) {
    return this.api.get<CertificateJournal>(
      this.root(id) + "deliveries/",
      this.query(status, search).set("offset", offset).set("limit", 20),
    );
  }
  retry(id: number, ids?: string[]) {
    return this.api.post<{ count: number }>(this.root(id) + "retry/", ids ? { ids } : {});
  }
  pdf(id: number, certificateId: string) {
    return this.api.getFile(this.root(id) + `deliveries/${certificateId}/pdf/`);
  }
  currentPdf(id: number, certificateId: string, revision: number) {
    return this.api.postFile(this.root(id) + `deliveries/${certificateId}/pdf/`, { revision });
  }
  selection(
    id: number,
    revision: number,
    action: "send" | "refresh" | "retry",
    selection: CertificateSelection,
  ) {
    return this.api.post<{ count: number; skipped: number }>(this.root(id) + "selection/", {
      revision,
      action,
      ...selection,
    });
  }
  archive(id: number, status: CertificateFilter, search: string) {
    return this.api.getFile(this.root(id) + "archive/", this.query(status, search));
  }
  currentArchive(id: number, revision: number, selection: CertificateSelection) {
    return this.api.postFile(this.root(id) + "archive/", { revision, ...selection });
  }
  mine(id: number) {
    return this.api.get<{ id: string; issuedAt: string; url: string }[]>(
      `/programs/${id}/certificates/me/`,
    );
  }
}
