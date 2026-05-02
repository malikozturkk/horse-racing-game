import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useBarnStore } from "../stores/barnStore";

export interface UseBarnOptions {
  autoTick?: boolean;
  tickInterval?: number;
  maxDecay?: number;
}

export function useBarn(options: UseBarnOptions = {}) {
  const { autoTick = true, tickInterval = 250, maxDecay = 1.4 } = options;

  const store = useBarnStore();
  const { allHorses, raceEntrants, hasLineup } = storeToRefs(store);

  let timerId: ReturnType<typeof setInterval> | undefined;

  function startTick(): void {
    if (timerId !== undefined) return;
    timerId = setInterval(
      () => store.tickBarnConditions(maxDecay),
      tickInterval
    );
  }

  function stopTick(): void {
    if (timerId !== undefined) {
      clearInterval(timerId);
      timerId = undefined;
    }
  }

  onMounted(() => {
    if (autoTick) startTick();
  });
  onUnmounted(() => {
    stopTick();
  });

  return {
    allHorses,
    raceEntrants,
    hasLineup,
    drawLineup: store.drawLineup,
    resetBarn: store.resetBarn,
    recoverHorse: store.recoverHorse,
    startTick,
    stopTick,
  };
}
