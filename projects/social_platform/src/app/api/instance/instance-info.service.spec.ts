/** @format */
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { environment } from "@environment";
import { InstanceRepositoryPort } from "@domain/instance/ports/instance.repository.port";
import { InstanceInfoService } from "./instance-info.service";

describe("Конфигурация отдельного экземпляра", () => {
  const data = {
    enabled: true,
    programId: 7,
    brandName: "Сознание права",
    logoUrl: "https://pilot.example.test/logo.png",
    frontendUrl: "https://pilot.example.test",
  };
  let previous: boolean;
  const repository = { config: vi.fn() };
  beforeEach(() => {
    previous = environment.instanceMode;
    environment.instanceMode = true;
    repository.config.mockReset();
    repository.config.mockReturnValue(of(data));
    TestBed.configureTestingModule({
      providers: [{ provide: InstanceRepositoryPort, useValue: repository }],
    });
  });
  afterEach(() => {
    environment.instanceMode = previous;
  });
  it("обычная сборка не запрашивает конфигурацию", async () => {
    environment.instanceMode = false;
    const instance = TestBed.inject(InstanceInfoService);
    await instance.initialize();
    expect(repository.config).not.toHaveBeenCalled();
    expect(instance.name()).toBe("PROCOLLAB");
  });
  it("пилот получает бренд и маршруты именно своей программы", async () => {
    const instance = TestBed.inject(InstanceInfoService);
    await instance.initialize(data.frontendUrl);
    expect(instance.enabled()).toBe(true);
    expect(instance.name()).toBe("Сознание права");
    expect(instance.programUrl()).toBe("/office/program/7");
    expect(instance.registrationUrl()).toBe("/program-registration/7");
  });
  it.each([
    { enabled: false },
    { ...data, programId: 0 },
    { ...data, frontendUrl: "https://other.example.test" },
  ])("ошибочная конфигурация не открывает общий кабинет", async value => {
    repository.config.mockReturnValue(of(value));
    const instance = TestBed.inject(InstanceInfoService);
    await instance.initialize(data.frontendUrl);
    expect(instance.error()).toContain("Не удалось загрузить настройки пилота");
    expect(instance.enabled()).toBe(false);
  });
  it("сбой API показывает ошибку, не использует основной API", async () => {
    repository.config.mockReturnValue(throwError(() => new Error("unavailable")));
    const instance = TestBed.inject(InstanceInfoService);
    await instance.initialize();
    expect(instance.error()).toBeTruthy();
    expect(repository.config).toHaveBeenCalledTimes(1);
  });
});
