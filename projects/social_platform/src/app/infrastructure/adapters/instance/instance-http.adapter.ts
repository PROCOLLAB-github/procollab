/** @format */
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { InstanceConfig } from "@domain/instance/instance.model";
import { InstanceRepositoryPort } from "@domain/instance/ports/instance.repository.port";

@Injectable()
export class InstanceHttpAdapter implements InstanceRepositoryPort {
  private readonly api = inject(ApiService);
  config() {
    return this.api.get<InstanceConfig>("/instance/");
  }
}
