// Add the following code to introduce cstimer_module as a webworker. Thus, we will communicate with cstimer through message, and package this process into an asynchronous function.
export var cstimerWorker = (function () {
	var worker = new Worker("cstimer_module.js");

	var callbacks = {};
	var msgid = 0;

	worker.onmessage = function (e) {
		var data = e.data; //data: [msgid, type, ret]
		var callback = callbacks[data[0]];
		delete callbacks[data[0]];
		callback && callback(data[2]);
	};

	function callWorkerAsync(type, details) {
		return new Promise(
			function (type, details, resolve) {
				++msgid;
				callbacks[msgid] = resolve;
				worker.postMessage([msgid, type, details]);
			}.bind(null, type, details)
		);
	}

	return {
		getScrambleTypes: function () {
			return callWorkerAsync("scrtype");
		},
		getScramble: function () {
			return callWorkerAsync("scramble", Array.prototype.slice.apply(arguments));
		},
		setSeed: function (seed) {
			return callWorkerAsync("seed", [seed]);
		},
		setGlobal: function (key, value) {
			return callWorkerAsync("set", [key, value]);
		},
		getImage: function (scramble, type) {
			return callWorkerAsync("image", [scramble, type]);
		},
	};
})();
