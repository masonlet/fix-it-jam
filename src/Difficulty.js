import { TUNING } from "./config/Tuning";

export class Difficulty {
  update (elapsedTime) {
    return {
      beltSpeed: TUNING.BELT_SPEED_BASE + elapsedTime * TUNING.BELT_SPEED_RAMP_PER_SEC,
      spawnInterval: Math.max(
        TUNING.SPAWN_INTERVAL_MIN,
        TUNING.SPAWN_INTERVAL_START - elapsedTime * TUNING.SPAWN_INTERVAL_RAMP_PER_SEC
      ),
      minigameTimeMax: Math.max(
        TUNING.MINIGAME_TIME_MAX_MIN,
        TUNING.MINIGAME_TIME_MAX_START - elapsedTime * TUNING.MINIGAME_TIME_RAMP_PER_SEC
      ),
    };
  }
}
