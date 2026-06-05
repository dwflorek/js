function randomOn(lo, hi) {
	return lo + (Math.random() * (hi - lo));
}

function wrapOntoZeroOne(val) {
	let isNeg = false;
	if (val < 0.0) {
		isNeg = true;
		val = -val;
	}
	val = val - (val>>0);
	if (isNeg) {
		val = 1.0 - val;
	}
	return val;
}

function clamp(x, lo, hi) {
	if (x < lo) {
		return lo;
	}
	if (x > hi) {
		return hi;
	}
	return x;
}

//                                                                                                               __
// more like "linear ramp" -- result is 0 when val < lo, 1 when val > hi, and ramps up linearly between them: __/
function step(val, lo, hi) {
	if (val < lo) {
        	return 0.0;
	}
	else if (val > hi) {
        	return 1.0;
	}
	else {
        	return (val - lo) / (hi - lo);
	}
}

//                                                                                              ___
// ramp up across a 1-pixel range around lo, and back down across a 1-pixel range around hi: __/   \__
function bridge(val, lo, hi) {
	return step(val, lo - 0.5, lo + 0.5) - step(val, hi - 0.5, hi + 0.5);
}

function to8Bit(x) {
	const i = (256*x)>>0;
	return clamp(i, 0, 255);
}
