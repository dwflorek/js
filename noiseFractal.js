class NoiseFractal {
	constructor() {
		this.noise = undefined;
		this.octaves = 1.0;
		this.baseFreq = 3.0;
		this.baseAmpl = 0.333;
		this.octaveFreqFactor = 2.0;
		this.octaveAmplFactor = 0.5;
		this.scaleFactor = 1.0;
	}

	setNoise(noise) {
		this.noise = noise;
	}

	setOctaves(o) {
		this.octaves = o;
	}

	setBaseFreq(f) {
		this.baseFreq = f;
	}

	setBaseAmpl(a) {
		this.baseAmpl = a;
	}

	setOctaveFreqFactor(ff) {
		this.octaveFreqFactor = ff;
	}

	setOctaveAmplFactor(af) {
		this.octaveAmplFactor = af;
	}

	setScaleFactor(sf) {
		this.scaleFactor = sf;
	}

	getValueAt(x, y, z) {
		let val = 0.0;
		if (this.noise === null) {
			return val;
		}
		let f = this.baseFreq;
		let a = this.baseAmpl;
		for (let i = 0; i < this.octaves; ++i) {
			// TODO: offset (x,y,z) for each octave
			val += a * this.noise.getValueAt(f*x, f*y, f*z);
			f *= this.octaveFreqFactor;
			a *= this.octaveAmplFactor;
		}
		return this.scaleFactor * val;
	}
}
