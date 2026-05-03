import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useBarn } from "../../../src/composables/useBarn";
import { asHorseId } from "../../../src/domain/shared/types";
import { installTestServices } from "../../helpers/services";
import { withSetup } from "../../helpers/withSetup";

describe("composables/useBarn", () => {
  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    installTestServices({ seed: 1 });
  });

  afterEach(() => {
    cleanup?.();
    cleanup = null;
  });

  it("exposes barn store reactive refs and helpers", () => {
    const { result, unmount } = withSetup(() => useBarn());
    cleanup = unmount;
    expect(result.horseCount.value).toBe(0);
    expect(result.isPopulated.value).toBe(false);

    result.generateBarn();
    expect(result.horseCount.value).toBe(20);
    expect(result.isPopulated.value).toBe(true);
    expect(result.allHorses.value).toHaveLength(20);
  });

  it("getById and applyConditionDelta proxy to the store", () => {
    const { result, unmount } = withSetup(() => useBarn());
    cleanup = unmount;
    result.generateBarn();
    const first = result.allHorses.value[0]!;
    const before = first.condition;
    result.applyConditionDelta(asHorseId(first.id as unknown as number), -10);
    const updated = result.getById(first.id);
    expect(updated?.condition).toBe(Math.max(1, before - 10));
  });

  it("resetBarn() regenerates the barn", () => {
    const { result, unmount } = withSetup(() => useBarn());
    cleanup = unmount;
    result.generateBarn();
    result.resetBarn();
    expect(result.horseCount.value).toBe(20);
  });
});
