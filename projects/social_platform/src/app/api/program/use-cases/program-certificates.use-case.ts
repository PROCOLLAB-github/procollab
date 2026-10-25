/** @format */
import { inject, Injectable } from "@angular/core";
import { ProgramCertificatesRepositoryPort } from "@domain/program/ports/program-certificates.repository.port";
@Injectable()
export class ProgramCertificatesUseCase {
  private readonly repository = inject(ProgramCertificatesRepositoryPort);
  readonly settings = this.repository.settings.bind(this.repository);
  readonly save = this.repository.save.bind(this.repository);
  readonly upload = this.repository.upload.bind(this.repository);
  readonly asset = this.repository.asset.bind(this.repository);
  readonly preview = this.repository.preview.bind(this.repository);
  readonly test = this.repository.test.bind(this.repository);
  readonly activate = this.repository.activate.bind(this.repository);
  readonly queue = this.repository.queue.bind(this.repository);
  readonly journal = this.repository.journal.bind(this.repository);
  readonly retry = this.repository.retry.bind(this.repository);
  readonly pdf = this.repository.pdf.bind(this.repository);
  readonly currentPdf = this.repository.currentPdf.bind(this.repository);
  readonly selection = this.repository.selection.bind(this.repository);
  readonly archive = this.repository.archive.bind(this.repository);
  readonly currentArchive = this.repository.currentArchive.bind(this.repository);
  readonly mine = this.repository.mine.bind(this.repository);
}
