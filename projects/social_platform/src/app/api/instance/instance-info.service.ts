/** @format */
import { computed, inject, Injectable, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "@environment";
import { InstanceConfig } from "@domain/instance/instance.model";
import { InstanceRepositoryPort } from "@domain/instance/ports/instance.repository.port";

@Injectable({ providedIn: "root" })
export class InstanceInfoService {
  private readonly repository = inject(InstanceRepositoryPort, { optional: true });
  private readonly config = signal<InstanceConfig>({ enabled: false });
  readonly enabled = computed(() => this.config().enabled);
  readonly demoMode = computed(() => this.config().demoMode === true);
  readonly error = signal<string | null>(null);
  readonly name = computed(() => this.config().brandName || "PROCOLLAB");
  readonly logo = computed(() =>
    this.enabled() ? this.config().logoUrl || "" : "/assets/images/shared/logo.svg",
  );
  readonly logoBackground = computed(() => this.config().logoBackground ?? "transparent");
  readonly favicon = computed(() => this.config().faviconUrl || "");
  readonly programId = computed(() => this.config().programId ?? null);
  readonly registrationUrl = computed(() => `/program-registration/${this.programId()}`);
  readonly programUrl = computed(() => `/office/program/${this.programId()}`);

  async initialize(expectedOrigin?: string): Promise<void> {
    if (!environment.instanceMode) return;
    try {
      if (!this.repository) throw new Error("Instance repository missing");
      const data = await firstValueFrom(this.repository.config());
      if (
        !data.enabled ||
        !Number.isInteger(data.programId) ||
        (data.programId ?? 0) < 1 ||
        !data.brandName?.trim() ||
        (expectedOrigin && data.frontendUrl !== expectedOrigin)
      ) {
        throw new Error("Instance not configured");
      }
      this.config.set(data);
      this.error.set(null);
    } catch {
      this.error.set(
        "Не удалось загрузить настройки пилота. Обновите страницу или обратитесь к организатору.",
      );
    }
  }
}
