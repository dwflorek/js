// A flat-colored thing -- in fact, the only relevant value is the alpha channel, the
// WatchFaceStudio UI provides for specifying the color.  I'll add more capability later.
class SpokeRing {
	constructor(r1, r2, numSpokes, thickness, indicatorThickness) {
		this.r1 = Math.min(r1, r2);
		this.r2 = Math.max(r1, r2);
		this.numSpokes = numSpokes;
		this.thick = thickness;
		this.indThick = indicatorThickness;
	}
	draw(img) {
		const cx = (img.imgData.width-1)/2.0;
		const cy = (img.imgData.height-1)/2.0;
		const r1_lo = this.r1 - this.thick/2.0;
		const r1_hi = this.r1 + this.thick/2.0;
		const r2_lo = this.r2 - this.thick/2.0;
		const r2_hi = this.r2 + this.thick/2.0;
		const indX_lo = cx - this.indThick/2.0;
		const indX_hi = cx + this.indThick/2.0;
		const spokeX_lo = cx - this.thick/2.0;
		const spokeX_hi = cx + this.thick/2.0;
		console.log("center: (", cx, ",", cy, ")");
		let pixelIndex = 0;
		for (let y = 0; y < img.imgData.height; ++y) {
			for (let x = 0; x < img.imgData.width; ++x) {
				const r = Math.sqrt((x - cx)*(x - cx) + (y - cy)*(y - cy));
				const alphas = [];
				// alpha based on distance from the r1 & r2 rings
				alphas.push(bridge(r, r1_lo, r1_hi));
				alphas.push(bridge(r, r2_lo, r2_hi));
				// alpha based on distance from the N spokes connecting the rings, including the indicator-spoke
				if (r >= this.r1 && r <= this.r2) {
					for (let spoke = 0; spoke < this.numSpokes; ++spoke) {
						const ang = spoke * (2 * Math.PI) / this.numSpokes;
						// note: to check if pixel (x, y) is near spoke N, we're rotating it
						//       CCW from there by the angle of the spoke and seeing if it's
						//       near the spoke at 12 o'clock. This is normal CCW rotation,
						//       except y is flipped
						const rotX = cx + ( (x - cx)*Math.cos(ang) - (cy - y)*Math.sin(ang) );
						const rotY = cy - ( (x - cx)*Math.sin(ang) + (cy - y)*Math.cos(ang) );
						if (rotY < cy) { // include only the 12 o'clock case, not the 6 o'clock
							if (spoke == 0) {
								alphas.push(bridge(rotX, indX_lo, indX_hi));
							} else {
								alphas.push(bridge(rotX, spokeX_lo, spokeX_hi));
							}
						}
					}
				}
				// pick the largest alpha as being the useful value, most pixels will have all-zero
				const alpha = Math.max(...alphas);
				const val = to8Bit(alpha);
				if ( x == 224 && y == 3 ) {
					console.log("pixel at (224, 3): alpha = ", alpha, ", val = ", val);
				}
				img.compositePixel(pixelIndex, [val, val, val, val]);
				pixelIndex += 4;
			}
		}
	}
}

class BeadRing {
	constructor(r, thickness, numBeads, beadRadius, indicatorBeadRadius) {
		this.r = r;
		this.thick = thickness;
		this.numBeads = numBeads;
		this.beadR = beadRadius;
		this.indR = indicatorBeadRadius;
	}
	draw(img) {
		const cx = (img.imgData.width-1)/2.0;
		const cy = (img.imgData.height-1)/2.0;
		const r_lo = this.r - this.thick/2.0;
		const r_hi = this.r + this.thick/2.0;
		const r_bead_lo = this.r - Math.max(this.beadR, this.indR) - 0.5;
		const r_bead_hi = this.r + Math.max(this.beadR, this.indR) + 0.5;
		let pixelIndex = 0;
		for (let y = 0; y < img.imgData.height; ++y) {
			for (let x = 0; x < img.imgData.width; ++x) {
				const r = Math.sqrt((x - cx)*(x - cx) + (y - cy)*(y - cy));
				const alphas = [];
				// alpha based on distance from the ring
				alphas.push(bridge(r, r_lo, r_hi));
				// alpha based on distance from the N beads, including the indicator-bead
				if (r >= r_bead_lo && r <= r_bead_hi) {
					for (let bead = 0; bead < this.numBeads; ++bead) {
						const ang = bead * (2 * Math.PI) / this.numBeads;
						// note: to check if pixel (x, y) is near bead N, we're rotating it
						//       CCW from there by the angle of the bead and seeing if it's
						//       near the bead at 12 o'clock. This is normal CCW rotation,
						//       except y is flipped
						const rotX = cx + ( (x - cx)*Math.cos(ang) - (cy - y)*Math.sin(ang) );
						const rotY = cy - ( (x - cx)*Math.sin(ang) + (cy - y)*Math.cos(ang) );
						// now check if the rotated point is within bead-radius of the center of the bead
						const beadX = cx;
						const beadY = cy - this.r;
						const beadDist = Math.sqrt((rotX - beadX)*(rotX - beadX) + (rotY - beadY)*(rotY - beadY));
						if (bead == 0) {
							alphas.push(1.0 - step(beadDist, this.indR - 0.5, this.indR + 0.5));
						} else {
							alphas.push(1.0 - step(beadDist, this.beadR - 0.5, this.beadR + 0.5));
						}
					}
				}
				// pick the largest alpha as being the useful value, most pixels will have all-zero
				const alpha = Math.max(...alphas);
				const val = to8Bit(alpha);
				if ( x == 224 && y == 3 ) {
					console.log("pixel at (224, 3): alpha = ", alpha, ", val = ", val);
				}
				img.compositePixel(pixelIndex, [val, val, val, val]);
				pixelIndex += 4;
			}
		}
	}
}

let img;

function drawScene(img) {
	img.clear([0, 0, 0, 0]); // [34, 22, 84, 255]);
	// ---------------------
	// testing, until I get bugs ironed out
	// const test_ring = new SpokeRing(100, 200, 0, 5, 10); // no spokes, works fine
	// const test_ring = new SpokeRing(100, 200, 1, 5, 10); // one spoke (indicator), renders solid, ok let's remember how to rotate a point
	// const test_ring = new SpokeRing(100, 200, 7, 5, 10); // seven spokes
	// const test_ring = new BeadRing(200, 3, 7, 4.5, 6); // seven beads
	// test_ring.draw(img);
	// -------------------
	const s_ring = new BeadRing(220, 3, 1, 0, 5); // second-hand ring: outer-most, single fine ring, only the indicator-bead
	const m_ring = new SpokeRing(180, 210, 5, 3, 6); // minute-hand ring: next-outer, double-ring, 5 spokes
	const h_ring = new SpokeRing(120, 170, 3, 3, 6); // hour-hand ring: inner, double-ring, 3 spokes
	s_ring.draw(img);
	//m_ring.draw(img);
	//h_ring.draw(img);
	img.drawToCanvas();
}

function initFromParams() {
}
	
window.onload = function() {
	initFromParams();
	img = new Img('rings');
	drawScene(img);
	img.saveToFile('rings_secs.png', 'image/png', 1.0);
	//img.saveToFile('rings_mins.png', 'image/png', 1.0);
	//img.saveToFile('rings_hours.png', 'image/png', 1.0);
}
