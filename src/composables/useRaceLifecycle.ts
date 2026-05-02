import { onScopeDispose, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRaceStore, useScheduleStore, useSessionStore } from "../stores";

export const useRaceLifecycle = () => {
  const session = useSessionStore();
  const race = useRaceStore();
  const schedule = useScheduleStore();

  const { phase, statusLabel } = storeToRefs(session);
  const {
    status: raceStatus,
    runtime,
    liveStandings,
    progressRatio,
  } = storeToRefs(race);
  const {
    rounds,
    currentRound,
    progressRatio: scheduleProgressRatio,
    isFullyCompleted,
  } = storeToRefs(schedule);

  const stopWatcher = watch(
    () => race.status,
    (now, prev) => {
      if (prev !== "completed" && now === "completed") {
        session.onRoundFinished();
      }
    }
  );

  onScopeDispose(() => {
    stopWatcher();
  });

  return {
    phase,
    statusLabel,
    raceStatus,
    runtime,
    liveStandings,
    progressRatio,
    scheduleProgressRatio,
    rounds,
    currentRound,
    isFullyCompleted,

    generateSchedule: () => session.generateSchedule(),
    startRace: () => session.startRace(),
    pauseRace: () => session.pauseRace(),
    resumeRace: () => session.resumeRace(),
    stopRace: () => session.stopRace(),
    setAutoAdvance: (value: boolean) => race.setAutoAdvance(value),
  };
};
