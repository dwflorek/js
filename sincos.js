class Pair {
	constructor(v1, v2) {
		this.v1 = v1;
		this.v2 = v2;
	}

	first() {
		return this.v1;
	}

	second() {
		return this.v2;
	}
}

class SinCos {
	constructor(nDivs) {
		this.nDivs = nDivs;
		this.sincoss = [];
		const dAng = 2*Math.PI / nDivs;
		let ang = 0.0;
		for (let i = 0; i < nDivs; ++i) {
			this.sincoss.push(new Pair(Math.sin(ang), Math.cos(ang)));
			ang += dAng;
		}
	}

	getIndex(degrees) {
		let idx = undefined;
		if (degrees < 0) {
			degrees = -degrees;
			idx = (degrees * this.nDivs / 360.0) >> 0;
			idx = idx % this.nDivs;
			if (idx > 0) {
				idx = this.nDivs - idx;
			}
		}
		else {
			idx = (degrees * this.nDivs / 360.0) >> 0;
			idx = idx % this.nDivs;
		}
		return idx;
	}

	getSin(degrees) {
		const idx = this.getIndex(degrees);
		return this.sincoss[idx].first();
	}

	getCos(degrees) {
		const idx = this.getIndex(degrees);
		return this.sincoss[idx].second();
	}

	getSinCos(degrees) {
		const idx = this.getIndex(degrees);
		return this.sincoss[idx];
	}
}
