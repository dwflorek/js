class Vector4 {
	constructor(x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	copied() {
		return new Vector4(this.x, this.y, this.z, this.w);
	}

	neg() {
		return this.scale(-1.0);
	}

	negd() {
		return this.copied().neg();
	}

	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;
		return this;
	}

	added(v) {
		return this.copied().add(v);
	}

	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;
		return this;
	}

	subd(v) {
		return this.copied().sub(v);
	}

	scale(s) {
		this.x *= s;
		this.y *= s;
		this.z *= s;
		return this;
	}

	scaled(s) {
		return this.copied().scale(s);
	}

	innerProduct(v) {
		return (this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w);
	}

	dot3(v) {
		return (this.x * v.x + this.y * v.y + this.z * v.z);
	}

	lenSqrd() {
		// w != 0.0 ? [x/w, y/w, z/w] . [x/w, y/w, z/w] = x^2/w^2 + y^2/w^2 + z^2/w^2 = (x^2 + y^2 + z^2)/w^2
		//          : [x, y, z] . [x, y, z] = x^2 + y^2 + z^2
		const dot = this.dot3(this);
		return (this.w == 0.0 || this.w == 1.0) ? dot : dot / (this.w * this.w);
	}

	len() {
		return Math.sqrt(this.lenSqrd());
	}

	// if w != 0, divide through by w (making w = 1)
	homogenize() {
		if (this.w != 0.0 && this.w != 1.0) {
			this.x /= this.w;
			this.y /= this.w;
			this.z /= this.w;
			this.w = 1.0;
		}
		return this;
	}

	homogenized() {
		return this.copied().homogenize();
	}

	// convert to (homogenized as needed) unit-vector
	normalize() {
		this.homogenize();
		const l = this.len();
		if (l > 0.0) {
			this.scale(1.0 / l);
		}
		return this;
	}

	normalized() {
		return this.copied().normalize();
	}

	getArray() {
		return [this.x, this.y, this.z, this.w];
	}

	log() {
		console.log(`  [ ${this.x}, ${this.y}, ${this.z}, ${this.w} ]`);
	}
};
