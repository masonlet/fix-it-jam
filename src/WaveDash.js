const LEADERBOARD_NAME = "fix-it-high-scores";
const SORT_DESCENDING = 1;
const DISPLAY_NUMERIC = 0;

let leaderboardId = null;

const isAvailable = () => typeof window !== 'undefined' && typeof window.Wavedash !== 'undefined';

const boot = async () => {
  if (!isAvailable()) return;

  try {
    window.Wavedash.init();

    const response = await window.Wavedash.getOrCreateLeaderboard(
      LEADERBOARD_NAME,
      SORT_DESCENDING,
      DISPLAY_NUMERIC
    );

    if (response.success) leaderboardId = response.data.id;
    else console.warn('[Wavedash] Failed to resolve leaderboard:', response.message);
  } catch (e) {
    console.warn('[Wavedash] boot failed:', e);
  }
};

const submitScore = async (score) => {
  if (!isAvailable() || !leaderboardId) return;

  try {
    await window.Wavedash.uploadLeaderboardScore(leaderboardId, score, true);
  } catch (e) {
    console.warn('[Wavedash] submitScore failed:', e);
  }
}

export const WaveDash = {
  isAvailable,
  boot,
  submitScore,
}
