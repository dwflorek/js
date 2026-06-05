class Matrix4 {
	constructor() {
		// identity, why not
		this.rows = [
			[1.0, 0.0, 0.0, 0.0],
			[0.0, 1.0, 0.0, 0.0],
			[0.0, 0.0, 1.0, 0.0],
			[0.0, 0.0, 0.0, 1.0]
		];
	}

	copied() {
		const m = new Matrix4();
		for (let j = 0; j < 4; j++) {
			for (let i = 0; i < 4; i++) {
				m.rows[j][i] = this.rows[j][i];
			}
		}
		return m;
	}

	preMultipliedBy(m) {
		const product = newMatrix();
		for (let j = 0; j < 4; j++) {
			for (let i = 0; i < 4; i++) {
				let sum = 0.0;
				for (let k = 0; k < 4; k++) {
					sum += m.rows[j][k] * this.rows[k][i];
				}
				product.rows[j][i] = sum;
			}
		}
		return product;
	}

	// internal
	setRowVals_(j, v0, v1, v2, v3) {
		this.rows[j][0] = v0;
		this.rows[j][1] = v1;
		this.rows[j][2] = v2;
		this.rows[j][3] = v3;
	}

	setVals(
		m00, m01, m02, m03,
		m10, m11, m12, m13,
		m20, m21, m22, m23,
		m30, m31, m32, m33
	) {
		this.setRowVals_(0, m00, m01, m02, m03);
		this.setRowVals_(1, m10, m11, m12, m13);
		this.setRowVals_(2, m20, m21, m22, m23);
		this.setRowVals_(3, m30, m31, m32, m33);
	}

	makeIdentity() {
		this.setVals(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
	}

	makeTranslation(tv) {
		this.setVals(
			1.0, 0.0, 0.0, tv.x,
			0.0, 1.0, 0.0, tv.y,
			0.0, 0.0, 1.0, tv.z,
			0.0, 0.0, 0.0, 1.0
		);
	}

	makeScale(sv) {
		this.setVals(
			sv.x,  0.0,  0.0, 0.0,
			 0.0, sv.y,  0.0, 0.0,
			 0.0,  0.0, sv.z, 0.0,
			 0.0,  0.0,  0.0, 1.0
		);
	}

	makeRotation(a, deg) {
		const c = Math.cos(deg * Math.PI / 180.0);
		const s = Math.sin(deg * Math.PI / 180.0);
		if (a == "x" || a == "X") {
			this.setVals(
				1.0, 0.0, 0.0, 0.0,
				0.0,  c,  -s,  0.0,
				0.0,  s,   c,  0.0,
				0.0, 0.0, 0.0, 1.0
			);
		} else if (a == "y" || a == "Y") {
			this.setVals(
				 c,  0.0,  s,  0.0,
				0.0, 1.0, 0.0, 0.0,
				-s,  0.0,  c,  0.0,
				0.0, 0.0, 0.0, 1.0
			);
		} else if (a == "z" || a == "Z") {
			this.setVals(
				 c,  -s,  0.0, 0.0,
				 s,   c,  0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
			 	0.0, 0.0, 0.0, 1.0
			);
		}
	}

	makePerspective(args) {
		this.setVals(
			 1.0,  0.0,  0.0,  0.0,
			 0.0,  1.0,  0.0,  0.0,
			 0.0,  0.0,  1.0,  0.0,
			 0.0,  0.0,  0.0,  1.0
		);
	}

	log() {
		console.log(`  / ${this.rows[0][0]} ${this.rows[0][1]} ${this.rows[0][2]} ${this.rows[0][3]} \\`);
		console.log(`  | ${this.rows[1][0]} ${this.rows[1][1]} ${this.rows[1][2]} ${this.rows[1][3]} |`);
		console.log(`  | ${this.rows[2][0]} ${this.rows[2][1]} ${this.rows[2][2]} ${this.rows[2][3]} |`);
		console.log(`  \\ ${this.rows[3][0]} ${this.rows[3][1]} ${this.rows[3][2]} ${this.rows[3][3]} /`);
	}

	applyToVector4(v) {
		//console.log('m:');
		//this.log();
		//console.log('v:');
		//v.log();
		const vArray = v.getArray();
		const result = [0.0, 0.0, 0.0, 1.0];
		for (let j = 0; j < 4; ++j) {
			let sum = 0.0;
			for (let i = 0; i < 4; ++i) {
				sum += this.rows[j][i] * vArray[i];
			}
			result[j] = sum;
		}
		//console.log('result:');
		//console.log(`  [ ${result[0]}, ${result[1]}, ${result[2]}, ${result[3]} ]`);
		return new Vector4(...result);
	}
};
