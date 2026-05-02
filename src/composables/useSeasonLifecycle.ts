import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useResultsStore, useSessionStore } from "../stores";

export const useSeasonLifecycle = (
  options: { autoBootstrap?: boolean } = {}
) => {
  const { autoBootstrap = true } = options;
  const session = useSessionStore();
  const results = useResultsStore();

  const { phase, seasonNumber, isSeasonOver } = storeToRefs(session);
  const { standings, seasonChampion, latestResult, hasAnyResult } =
    storeToRefs(results);

  onMounted(() => {
    if (autoBootstrap && session.phase === "idle" && session.createdAt === 0) {
      session.bootstrapSession();
    }
  });

  return {
    phase,
    seasonNumber,
    isSeasonOver,
    standings,
    seasonChampion,
    latestResult,
    hasAnyResult,

    bootstrap: () => session.bootstrapSession(),
    startNewSeason: () => session.startNewSeason(),
    resetSession: () => session.resetSession(),
    exportResults: () => results.exportSnapshot(),
  };
};
