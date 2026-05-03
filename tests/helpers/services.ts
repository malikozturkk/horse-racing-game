import {
  resetServices,
  setServices,
  type Services,
} from "../../src/infrastructure/container";
import { seededRng, type Rng } from "../../src/domain/shared/rng";
import {
  createFakeClock,
  type FakeClock,
} from "../../src/infrastructure/clock/fakeClock";
import {
  createFakeTicker,
  type FakeTicker,
} from "../../src/infrastructure/ticker/fakeTicker";

export interface TestServices extends Services {
  rng: Rng;
  ticker: FakeTicker;
  clock: FakeClock;
}

export interface InstallTestServicesOptions {
  readonly seed?: number;
  readonly clockStart?: number;
}

export const installTestServices = (
  options: InstallTestServicesOptions = {}
): TestServices => {
  resetServices();
  const services: TestServices = {
    rng: seededRng(options.seed ?? 42),
    ticker: createFakeTicker(),
    clock: createFakeClock(options.clockStart ?? 0),
  };
  setServices(services);
  return services;
};
