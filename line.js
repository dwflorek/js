class OrderedPair {
	constructor(v1, v2) {
		if (v1 < v2) {
			this.minV = v1;
			this.maxV = v2;
			this.reversed = false;
		} else {
			this.minV = v2;
			this.maxV = v1;
			this.reversed = true;
		}
		this.delta = this.maxV - this.minV;
	}

	log(pfx) {
		const order = this.reversed ? "reversed" : "original";
		console.log(`${pfx}`);
		console.log(`  min: ${this.minV}, max: ${this.maxV}, delta: ${this.delta}, ${order}`);
	}
}

class Line {
	constructor(v1, c1, v2, c2) {
		this.v1 = v1.copied();
		this.c1 = c1;
		this.v2 = v2.copied();
		this.c2 = c2;
		this.thickness = 20.0;
	}

	lerp(v1, v2, t) {
		// v1 + t*(v2 - v1)
		return v2.subd(v1).scale(t).add(v1);
	}

	posAt(t) {
		return this.lerp(this.v1, this.v2, t);
	}

	posAtNDC(t) {
		return this.lerp(this.xformedV1, this.xformedV2, t);
	}

	colorAt(t) {
		return this.lerp(this.c1, this.c2, t);
	}

	transform(toNDC) {
		// assumes toNDC is a matrix which applies model & view transforms:
		//   local coords -> world coords -> view coords -> normalized device coords (NDC space)
		this.xformedV1 = toNDC.applyToVector4(this.v1);
		this.xformedV2 = toNDC.applyToVector4(this.v2);
		//console.log('v1, v2:');
		//this.xformedV1.log();
		//this.xformedV2.log();
		this.xVals = new OrderedPair(this.xformedV1.x, this.xformedV2.x);
		this.yVals = new OrderedPair(this.xformedV1.y, this.xformedV2.y);
		this.zVals = new OrderedPair(this.xformedV1.z, this.xformedV2.z);
	}

	// minimal line-drawing: 1 pixel-width, no antialiasing, ignores Z vals
	simpleDrawToWindow(win) {
		const halfSize = (win.w < win.h) ? win.w / 2.0 : win.h / 2.0;
		const cX = win.x + (win.w - 1) / 2.0;
		const cY = win.y + (win.h - 1) / 2.0;
		const ndcToPixels = halfSize / 1.0; // or less if we desire a slight zoom-out
		if (this.xVals.delta > this.yVals.delta) {
			// line closer to horizontal
			const x1 = Math.round(cX + this.xVals.minV * ndcToPixels - 0.5)>>0;
			const x2 = Math.round(cX + this.xVals.maxV * ndcToPixels + 0.5)>>0;
			const fx1 = (x1 - cX) / ndcToPixels;
			const t1 = (fx1 - this.xVals.minV) / this.xVals.delta;
			const dt = 1.0 / (this.xVals.delta * ndcToPixels);
			let t = t1;
			for (let x = x1; x <= x2; ++x) {
				const sampleT = this.xVals.reversed ? (1.0 - t) : t;
				const p = this.posAtNDC(sampleT);
				if (p.x < this.xVals.minV || p.x > this.xVals.maxV) {
					t += dt;
					continue;
				}
				const y = Math.round(cY - p.y * ndcToPixels)>>0;
				const c = this.colorAt(sampleT);
				win.img.colorPixelXY(x, y, [to8Bit(c.x), to8Bit(c.y), to8Bit(c.z), to8Bit(c.w)]);
				t += dt;
			}
		} else {
			// line closer to vertical
			const y1 = Math.round(cY - this.yVals.minV * ndcToPixels + 0.5)>>0;
			const y2 = Math.round(cY - this.yVals.maxV * ndcToPixels - 0.5)>>0;
			const fy1 = (cY - y1) / ndcToPixels;
			const t1 = (fy1 - this.yVals.minV) / this.yVals.delta;
			const dt = 1.0 / (this.yVals.delta * ndcToPixels);
			let t = t1;
			for (let y = y1; y >= y2; --y) {
				const sampleT = this.yVals.reversed ? (1.0 - t) : t;
				const p = this.posAtNDC(sampleT);
				if (p.y < this.yVals.minV || p.y > this.yVals.maxV) {
					t += dt;
					continue;
				}
				const x = Math.round(cX + p.x * ndcToPixels)>>0;
				const c = this.colorAt(sampleT);
				win.img.colorPixelXY(x, y, [to8Bit(c.x), to8Bit(c.y), to8Bit(c.z), to8Bit(c.w)]);
				t += dt;
			}
		}
	}

	antialiasedDrawToWindow(win) {
		const halfSize = (win.w < win.h) ? win.w / 2.0 : win.h / 2.0;
		const cX = win.x + (win.w - 1) / 2.0;
		const cY = win.y + (win.h - 1) / 2.0;
		const ndcToPixels = halfSize / 1.0; // or less if we desire a slight zoom-out
		const xyLength = Math.sqrt(this.xVals.delta*this.xVals.delta + this.yVals.delta*this.yVals.delta);
		const ndcThickness = this.thickness / ndcToPixels;
		if (this.xVals.delta > this.yVals.delta) {
			// line closer to horizontal
			const cosAng = this.xVals.delta / xyLength;
			const halfYThickness = (ndcThickness / 2.0) / cosAng;
			const halfYPixel = (0.5 / ndcToPixels) / cosAng;
			const x1 = Math.round(cX + (this.xVals.minV - ndcThickness/2.0) * ndcToPixels - 1)>>0;
			const x2 = Math.round(cX + (this.xVals.maxV + ndcThickness/2.0) * ndcToPixels + 1)>>0;
			const fx1 = (x1 - cX) / ndcToPixels;
			const t1 = (fx1 - (this.xVals.minV - ndcThickness/2.0)) / this.xVals.delta;
			const dt = 1.0 / (this.xVals.delta * ndcToPixels);
			let t = t1;
			for (let x = x1; x <= x2; ++x) {
				const sampleT = this.xVals.reversed ? (1.0 - t) : t;
				const p = this.posAtNDC(sampleT);
				// TODO: handle ends correctly
				if (p.x < this.xVals.minV || p.x > this.xVals.maxV) {
					t += dt;
					continue;
				}
				const y1 = Math.round(cY - (p.y + halfYThickness) * ndcToPixels - 1)>>0;
				const y2 = Math.round(cY - (p.y - halfYThickness) * ndcToPixels + 1)>>0;
				for (let y = y1; y <= y2; ++y) {
					// ((x,y) - (v1 + t(v2 - v1))) . (v2 - v1) = 0
					// (((x,y) - v1) + t(v2 - v1)) . (v2 - v1) = 0
					// ((x,y) - v1) . (v2 - v1) + (t*(v2 - v1)) . (v2 - v1) = 0
					// t = - (((x, y) - v1) . (v2 - v1)) / ((v2 - v1) . (v2 - v1))
					// p = v1 + t(v2 - v1)
					// xy_p = (x,y) - p
					// d = |xy_p| = sqrt(xy_p . xy_p)
					//   = sqrt(((x,y) - p) . ((x,y) - p))
					//   = sqrt((x,y).(x.y) - 2p.(x,y) + p.p)
					//   = sqrt((x,y).(x.y) - 2(v1 + t(v2-v1)).(x,y) + (v1 + t(v2-v1)).(v1 + t(v2-v1)))
					//   = sqrt((x,y).(x.y) - 2*v1.(x,y) - 2t*(v2-v1).(x,y) + v1.v1 + 2t*v1.(v2-v1) + t^2*(v2-v1).(v2-v1))
					//   = sqrt((x,y).(x.y) - 2*v1.(x.y) + v1.v1 + 2t(v1.(v2-v1) - (v2-v1).(x,y)) + t^2*(v2-v1).(v2-v1))
					//   = sqrt((x,y).(x.y) - 2*v1.(x,y) + v1.v1 - 2[(((x,y)-v1).(v2-v1))/((v2-v1).(v2-v1))][v1.(v2-v1) - (x,y).(v2-v1)]) + [(((x,y)-v1).(v2-v1))^2/((v2-v1).(v2-v1))^2](v2-v1).(v2-v1)
					//   = sqrt(((x,y)-v1).((x,y)-v1) - 2[(((x,y)-v1).(v2-v1))/((v2-v1).(v2-v1))](v1-(x,y)).(v2-v1) 
					const dy = Math.abs(cY - y);
					const alpha = step(dy, halfYThickness - halfYPixel, halfYThickness + halfYPixel);
					
					const c = this.colorAt(sampleT); // fix this
					win.img.compositePixelXY(x, y, [to8Bit(c.x), to8Bit(c.y), to8Bit(c.z), to8Bit(c.w * alpha)]);
				}
				t += dt;
			}
		}
		else {
			// line closer to vertical
			const cosAng = this.yVals.delta / xyLength;
			const halfXThickness = (ndcThickness / 2.0) / cosAng;
			const halfXPixel = (0.5 / ndcToPixels) / cosAng;
			const y1 = Math.round(cY - (this.yVals.minV - ndcThickness/2.0) * ndcToPixels + 1)>>0;
			const y2 = Math.round(cY - (this.yVals.maxV + ndcThickness/2.0) * ndcToPixels - 1)>>0;
			const fy1 = (cY - y1) / ndcToPixels;
			const t1 = (fy1 - (this.yVals.minV - ndcThickness/2.0)) / this.yVals.delta;
			const dt = 1.0 / (this.yVals.delta * ndcToPixels);
			let t = t1;
			for (let y = y1; y >= y2; --y) {
				const sampleT = this.yVals.reversed ? (1.0 - t) : t;
				const p = this.posAtNDC(sampleT);
				// TODO: handle ends correctly
				if (p.y < this.yVals.minV || p.y > this.yVals.maxV) {
					t += dt;
					continue;
				}
				const x1 = Math.round(cX + (p.x - halfXThickness) * ndcToPixels - 1)>>0;
				const x2 = Math.round(cX + (p.x + halfXThickness) * ndcToPixels + 1)>>0;
				for (let x = x1; x <= x2; ++x) {
					const dx = Math.abs(x - cX);
					const alpha = step(dx, halfXThickness - halfXPixel, halfXThickness + halfXPixel);
					const c = this.colorAt(sampleT);
					win.img.compositePixelXY(x, y, [to8Bit(c.x), to8Bit(c.y), to8Bit(c.z), to8Bit(c.w * alpha)]);
				}
				t += dt;
			}
		}
	}

	drawToWindow(win) {
		//this.simpleDrawToWindow(win);
		this.antialiasedDrawToWindow(win);
	}
};
