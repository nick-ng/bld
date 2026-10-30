function generateTimeStamps(
	startTimeMs: number,
	pauseTimeMs: number,
	hideTimeMs: number,
	showHundredths: boolean
) {
	// if total time is over the minutes threshold, show the minutes digit anyway.
	const minutesThresholdMs = 1000 * 50; // 50 seconds
	const totalTimeMs = pauseTimeMs - startTimeMs;

	const subtitleTimestamps: { time: string; timer: string }[] = [];
	const timerIncrementMs = showHundredths ? 10 : 1000;
	for (let i = startTimeMs; i < pauseTimeMs; i += timerIncrementMs) {
		if (subtitleTimestamps.length === 0) {
		} else {
		}
	}
}

function formatTimestamp(timeMs: number) {}
