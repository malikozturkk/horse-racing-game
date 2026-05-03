# Horse Racing Game

İnteraktif at yarışı simülatörü. 20 atlık bir ahırdan 6 round, 10'arlı kadrolarla rastgele kura çekiyor; her round'u deterministik bir simülasyon motoruyla canlandırıp puanlıyor ve sezon şampiyonunu belirliyor.

## Overview

Kullanıcı **Program Üret** ile 6 round'luk takvimi oluşturur, **Başlat / Duraklat / Devam Et** ile her round'u tek tek çalıştırır; sezon sonunda şampiyon kartı görüntülenir.

Case gereksinimleri:

| Gereksinim                                  | Karşılanma                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| 20 atlık ahır (isim, renk, condition 1–100) | `domain/horse/factory.ts`, `BARN_SIZE = 20`                                  |
| 6 round, sabit mesafeler (1200–2200 m)      | `domain/schedule/constants.ts`                                               |
| Round başına 10 atın rastgele seçimi        | `schedule/factory.ts → pickLineup` (RNG shuffle)                             |
| Program oluşturma butonu                    | `HorseRace.vue → generate-btn`                                               |
| Start / Pause / Resume                      | Tek `start-btn`, `viewState`'e göre `session.startRace/pauseRace/resumeRace` |
| Yarış animasyonu + canlı sonuç tablosu      | `RaceTrack` + `RaceLane` + `LiveResultsPanel`                                |

## Tech Stack

- **Vue 3.5** (`<script setup>`) + **TypeScript ~6**
- **Pinia 3** — state management
- **Vue Router** — `/` Hipodrom, `/barn` Ahır, `/preview` UI showcase
- **Vite 8** + **Tailwind CSS v4** (`@theme` design tokens, scoped CSS)
- **Vitest 4** + **@vue/test-utils** + **jsdom** — unit/component
- **Playwright 1.59** — E2E + visual regression
- **ESLint + Prettier + Husky + lint-staged**

## Installation

```bash
npm install
npm run dev          # http://localhost:5173

# Üretim build + E2E için preview
npm run build
npm run preview      # http://127.0.0.1:4173

# Playwright tarayıcı (bir kerelik)
npx playwright install chromium
```

URL'e `?seed=42` eklendiğinde tüm rastgelelik bu seed üzerinden beslenir → yarış birebir tekrarlanabilir (`src/main.ts`).

## How It Works

### Mimari

```
src/
  domain/           saf TS, framework'siz iş kuralları
    horse, schedule, race, results, session, shared
  infrastructure/   yan etki adapter'ları
    ticker/         rafTicker (prod) + fakeTicker (test)
    clock/          systemClock + fakeClock
    container.ts    setServices() ile DI: { rng, ticker, clock }
  stores/           Pinia (barn, schedule, race, results, session)
  composables/      useRaceLifecycle, useSeasonLifecycle, useBarn
  components/       race/, ui/, layout/, barn/, horse/
  views/            HorseRace.vue, BarnView.vue
```

Tek yönlü bağımlılık: **domain → infrastructure → stores → composables → components**. Domain katmanı Vue/Pinia'dan tamamen bağımsız; race motoru aynı kodla hem `rafTicker` ile prod'da hem `fakeTicker.advance(ms)` ile testte koşar.

### State management (Pinia)

5 store, tek sorumluluk:

- **`sessionStore`** — `GamePhase` state machine (`idle → scheduled → racing → paused → seasonFinished`), `assertCanTransition` ile geçiş guard'ı, `Result<T, DomainError>` döner.
- **`barnStore`** — 20 at, `byId/allIds` index, `setConditions(Map)` ile her tick patch.
- **`scheduleStore`** — 6 round, `currentRoundIndex` cursor, `setRoundStatus`.
- **`raceStore`** — Aktif `RaceRuntime` (`shallowRef`), ticker subscribe, `liveStandings`, `isPhotoFinish`.
- **`resultsStore`** — `RoundResult[]`, kümülatif `Standing[]`, sezon şampiyonu (puan → galibiyet → ortalama süre tiebreaker).

### Race logic

1. **Schedule** — `buildSchedule` her round için `rng.shuffle(horseIds).slice(0, 10)`.
2. **Arming** — `raceStore.armRound(idx)` lineup'u resolve eder, her at için `decayPerMeter` örnekler.
3. **Tick (`advance`)** — Her frame:
   - `clampedDelta = min(rawDelta, 200ms)` (tab arka planda iken sıçrama yok),
   - `simDelta = clampedDelta × 6` (`RACE_TIME_SCALE`),
   - Hız: `14 + condition/100 × 14 + jitter(±4) m/s`, momentum 0.35,
   - Condition `tickConditionDecay` ile her metrede stokastik düşer (`MIN_CONDITION = 1`'de tabanlanır),
   - Bitiş çizgisini geçen at `finishedOrder`'a push, `finishRank` atanır.
4. **Finish** — `buildFinishOrder` finished + DNF'leri birleştirir, `defaultScoringPolicy` (`[10,7,5,3,2,1,1,1,1,1]`) puanları yazar, `commitRoundResult` `computeStandings`'i tetikler.
5. **Round geçişi** — `useRaceLifecycle` `race.status === "completed"` watcher'ı `session.onRoundFinished()`'i çağırır; `autoAdvance = false` → kullanıcı her round'u manuel başlatır.

### Animasyon

DOM watch yok. Her tick `progressMeters` güncellenir ve lane tek bir CSS değişkeni set eder:

```css
.lane__horse {
  left: calc(var(--lane-progress, 0) * 100%);
  transform: translate(calc(var(--lane-progress, 0) * -100%), -50%);
}
```

GPU compositor `left + transform`'u ucuza interpolate eder. `prefers-reduced-motion: reduce` tüm transition'ları kapatır.

## Features

- **Hipodrom (`/`)** — `viewState` makinesi (`empty / scheduled / racing / paused / roundFinished / seasonFinished`) tek layout'ta farklı paneller render eder.
- **Ahır (`/barn`)** — 20 atın profil kartları, barn-doors intro, condition bar.
- **Foto finiş** — Son 30 m içinde 15 m'den yakın iki at varsa `isPhotoFinish` flag'i + turuncu badge.
- **Mobile** — `Yarış / Atlar / Sonuç` alt-tab nav ile 3 kolonun tek-ekran sürümü.
- **Deterministik replay** — `?seed=N` ile aynı sezon byte-identical tekrar oynar.

## Testing

3 katmanlı, deterministik test stratejisi:

### Unit (`vitest`)

- **`tests/unit/domain/`** — `rng` (seed reproducibility), `simulationEngine`, `conditionDecay`, `scoringPolicy` (puan + DNF + tiebreaker), `schedule.factory`, `session.stateMachine`, `horse.factory/types`.
- **`tests/unit/infrastructure/`** — `fakeClock`, `fakeTicker.advance`, `container` DI.
- **`tests/unit/stores/`** — 5 store + cross-store sıralama (`raceStore → resultsStore` zinciri).
- **`tests/unit/composables/`** — `useBarn`, `useRaceLifecycle`, `useSeasonLifecycle` (`withSetup` helper).
- **`tests/unit/components/`** — `Button`, `Badge`, `ConditionBar`, `Panel`, `RaceLane`, `RaceTrack`, `ProgramPanel`, `LiveResultsPanel`, `ResultRow`, `ChampionCard`, `SeasonStandings`, `HorseRosterPanel`, `EmptyHipodromCenter`, `EmptyPlaceholder`, `ProgramRoundItem`. Pahalı SVG'ler (`HorseWithJockey`, `HorseProfile`, `BarnDoorsIntro`) `tests/setup.ts`'te stub'lı.

Coverage threshold (vitest.config.ts): lines/statements **80%**, branches **75%**, functions **80%**.

```bash
npm run test:unit              # tek koşum
npm run test:unit:watch        # watch
npm run test:unit:coverage     # v8 coverage (text + html + lcov)
```

### E2E (`@playwright/test`)

Vite preview build'ini otomatik boot ederek (`http://127.0.0.1:4173`) sezonu uçtan uca sürer. Her test seed'lenmiş URL'e gider (`goToApp({ seed })`) ve animasyonları kapatan stabilize CSS inject eder.

- **`hipodrom.spec.ts`** — empty → program üret (6 round) → start → racing → roundFinished → 10 sonuç satırı + 3 round zinciri.
- **`pause-resume.spec.ts`** — start → pause (`Duraklatıldı`) → resume (`Yarış Sürüyor`).
- **`results-ordering.spec.ts`** — sonuç tablosunda rank'lar `1..10` ardışık; podium gold/silver/bronze birer satır.

```bash
npm run test:e2e               # E2E (visual hariç)
npm run test:e2e:ui            # Playwright UI mode
```

### Visual regression

`e2e/visual.spec.ts` 4 kritik UI durumunu PNG snapshot ile karşılaştırır (`maxDiffPixelRatio: 0.02`). Baseline'lar `e2e/visual.spec.ts-snapshots/` altında commit'li:

1. `01-empty` — initial state
2. `02-scheduled` — program üretildi
3. `03-paused` — yarış başlatılıp duraklatıldı (stabil frame)
4. `04-round-finished` — round 1 sonuçları görünür

SVG çizimleri ve canlı timer'lar `mask` ile dışarıda bırakılır.

```bash
npm run test:visual            # snapshot karşılaştır
npm run test:visual:update     # baseline'ı yeniden üret
npm run test:all               # unit + E2E (visual hariç)
```

## Scripts

| Script                                 | Açıklama                                   |
| -------------------------------------- | ------------------------------------------ |
| `npm run dev`                          | Vite dev server (HMR)                      |
| `npm run build`                        | `vue-tsc -b && vite build`                 |
| `npm run preview`                      | Üretim build serve (E2E için)              |
| `npm test` / `npm run test:unit:watch` | Vitest watch                               |
| `npm run test:unit`                    | Vitest tek koşum                           |
| `npm run test:unit:coverage`           | Vitest + v8 coverage (threshold zorlamalı) |
| `npm run test:e2e`                     | Playwright (visual hariç)                  |
| `npm run test:visual`                  | Sadece visual regression                   |
| `npm run test:visual:update`           | Visual baseline güncelle                   |
| `npm run test:e2e:ui`                  | Playwright UI mode                         |
| `npm run test:all`                     | Unit + E2E                                 |
| `npm run lint`                         | ESLint (`.ts`, `.vue`)                     |

## Notes

- **DI container** — `infrastructure/container.ts` `{ rng, ticker, clock }` üçlüsünü merkezi tutar. `main.ts` `?seed=`'i `setServices({ rng: seededRng(seed) })` ile inject eder; testler aynı slot'u fake'liyor → prod ve test birebir aynı `simulationEngine`'i çalıştırır.
- **`shallowRef` runtime'da** — `RaceRuntime` her tick'te yeni referans olarak yayılır, nested `participants[]` immutable patch'lenir. 60 fps'te deep reactivity overhead'i elimine.
- **Branded ID'ler** (`HorseId`, `RoundId`, `SeasonId`) — runtime cost'u sıfır, `number ↔ HorseId` karışmasını compile-time'da yakalar.
- **`Result<T, E>`** — Session geçişleri throw etmez; UI hatayı butonların `disabled` state'ine map'ler.
- **Tailwind v4** sadece `@theme` ile design token publish etmek için kullanıldı; component'ler scoped CSS + custom property tabanlı.
