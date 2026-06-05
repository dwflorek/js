class Runner {
	constructor(startCallback, stopCallback, runningCallback, runningCallbackIntervalMsecs, callbackData) {
		this.isRunning = false;
		this.timer = null;

		this.startCb = startCallback;
		this.stopCb = stopCallback;
		this.runningCb = runningCallback;
		this.runningCbInterval = runningCallbackIntervalMsecs;
		this.cbData = callbackData;
	}

	_runCb(runner) {
		// make sure any last trigger doesn't actually invoke the callback if we've already stopped
		if (runner.isRunning) {
			// timer isn't started if this.runningCb is null -> no need to check here
			runner.runningCb(runner.cbData);
		}
	}

	start() {
		if (!this.isRunning) {
			this.isRunning = true;
			if (this.startCb) {
				this.startCb(this.cbData);
			}
			if (this.runningCb) {	
				this.timer = setInterval(this._runCb, this.runningCbInterval, this);
			}
		}
	} 

	stop() {
		if (this.isRunning) {
			this.isRunning = false;
			if (this.runningCb) {
				clearInterval(this.timer);
				this.timer = null;
			}
			if (this.stopCb) {
				this.stopCb(this.cbData);
			}
		}
	}

	running() {
		return this.isRunning;
	}
}

class SingleShotTimer {
	constructor(expiredCallback, expireMsecs, callbackData) {
		this.isRunning = false;
		this.timer = null;

		this.expiredCb = expiredCallback;
		this.expiredCbDelay = expireMsecs;
		this.cbData = callbackData;
	}

	_expiredCb(ssTimer) {
		if (ssTimer.running()) {
			ssTimer.timer = null;
			ssTimer.isRunning = false;
			ssTimer.expiredCb(ssTimer.cbData)
		}
	}

	start() {
		if (!this.isRunning) {
			if (this.expiredCb) {	
				this.isRunning = true;
				this.timer = setTimeout(this._expiredCb, this.expiredCbDelay, this);
			}
		}
	}

	stop() {
		if (this.isRunning) {
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			}
			this.isRunning = false;
		}
	}

	running() {
		return this.isRunning;
	}
}

