import { storeToRefs } from "pinia";
import { useBarnStore } from "../stores/barnStore";

export interface UseBarnOptions {
  readonly autoTick?: boolean;
  readonly tickInterval?: number;
  readonly maxDecay?: number;
}

export const useBarn = (_options: UseBarnOptions = {}) => {
  void _options;
  const store = useBarnStore();
  const { allHorses, horseCount, isPopulated } = storeToRefs(store);

  return {
    allHorses,
    horseCount,
    isPopulated,

    getById: store.getById,
    getByIds: store.getByIds,
    generateBarn: store.generateBarn,
    resetBarn: store.resetBarn,
    setCondition: store.setCondition,
    applyConditionDelta: store.applyConditionDelta,
    recoverHorse: store.recoverHorse,
    startTick: () => undefined,
    stopTick: () => undefined,
  };
};
