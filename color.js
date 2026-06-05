function hsvToRgb(hue, sat, val) {
	hue = wrapOntoZeroOne(hue);
	hue = hue * 6;
	const hBand = hue>>0;
	const hFrac = hue - hBand;

	const high = val;
	const low = (1.0 - sat)*high;
	const midIncr = low + hFrac*(high - low);;
	const midDecr = high - hFrac*(high - low);;

	if (hBand == 0) {
		return [high, midIncr, low];
	}
	if (hBand == 1) {
		return [midDecr, high, low];
	}
	if (hBand == 2) {
		return [low, high, midIncr];
	}
	if (hBand == 3) {
		return [low, midDecr, high];
	}
	if (hBand == 4) {
		return [midIncr, low, high];
	}
	else {
		return [high, low, midDecr];
	}
}

function sampleGetRandomColor() {
	const val = 1.0;
	const sat = 1.0;
	const hue = randomOn(0.05, 0.45); // orange-of-red to green-of-cyan
	const rgb = hsvToRgb(hue, sat, val);
	return [to8Bit(rgb[0]), to8Bit(rgb[1]), to8Bit(rgb[2])]
}

function scaleColor(c, s) {
	return [c[0]*s, c[1]*s, c[2]*s];
}

function addColor(c1, c2) {
	return [c1[0]+c2[0], c1[1]+c2[1], c1[2]+c2[2]];
}

function mixColor(c1, s1, c2, s2) {
	return addColor(scaleColor(c1, s1), scaleColor(c2, s2));
}

function fadeColor(c1, c2, t) {
	// return c1 + t(c2 - c1);
	// return c1*(1-t) + c2*t;
	return mixColor(c1, 1.0-t, c2, t);
}
