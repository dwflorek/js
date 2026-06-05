class Img {

	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.ctx = this.canvas.getContext("2d");
		// match image resolution to canvas (for now)
		this.imgData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
		this.cx = (this.imgData.width - 1)/2.0;
		this.cy = (this.imgData.height - 1)/2.0;
	}

	updateSize() {
		const newImgData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
		// TBD: copy relevant portion of this.imgData into newImgData
		this.imgData = newImgData;
		this.cx = (this.imgData.width - 1)/2.0;
		this.cy = (this.imgData.height - 1)/2.0;
	}
		
	width() {
		return this.imgData.width;
	}

	height() {
		return this.imgData.height;
	}

	center() {
		return [this.cx, this.cy];
	}

	colorPixel(pixelIndex, pixelColor) {
		this.imgData.data[pixelIndex] = pixelColor[0];
		this.imgData.data[pixelIndex+1] = pixelColor[1];
		this.imgData.data[pixelIndex+2] = pixelColor[2];
		this.imgData.data[pixelIndex+3] = pixelColor[3];
	}

	colorPixelXY(x, y, pixelColor) {
		if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) {
			return;
		}
		const pixelIndex = (y * this.width() + x)*4;
		this.colorPixel(pixelIndex, pixelColor);
	}

	clear(pixelColor) {
		let pidx = 0;
		for (let row = 0; row < this.height(); ++row) {
			for (let col = 0; col < this.width(); ++col) {
				this.colorPixel(pidx, pixelColor);
				pidx += 4;
			}
		}
	}

	compositePixel(pixelIndex, pixelColor) {
		if (pixelColor[3] == 0) {
			// do nothing
		}
		else if (pixelColor[3] == 255) {
			this.colorPixel(pixelIndex, pixelColor);
		}
		else {
			const base = [
				this.imgData.data[pixelIndex],
				this.imgData.data[pixelIndex+1],
				this.imgData.data[pixelIndex+2],
				this.imgData.data[pixelIndex+3],
			]
			let outColor = [];
			const baseAlpha = base[3]/255.0;
			const pixelAlpha = pixelColor[3]/255.0;
			const outAlpha = pixelAlpha + baseAlpha*(1.0 - pixelAlpha);
			for (let i = 0; i < 3; ++i) {
				outColor.push(
					Math.round((pixelColor[i]*pixelAlpha + base[i]*baseAlpha*(1.0 - pixelAlpha)) / outAlpha)>>0
				);
			}
			outColor.push( Math.round(255 * outAlpha)>>0 );
			this.colorPixel(pixelIndex, outColor);
		}
	}

	compositePixelXY(x, y, pixelColor) {
		const pixelIndex = (y * this.width() + x)*4;
		this.compositePixel(pixelIndex, pixelColor);
	}

	drawCircle(x, y, r, pixelColor) {
		const x1 = Math.max( x - r, 0 ) >> 0;
		const x2 = Math.min( x + r + 1, this.width() - 1 ) >> 0;
		const y1 = Math.max( y - r, 0 ) >> 0;
		const y2 = Math.min( y + r + 1, this.height() - 1 ) >> 0;
		const color = [pixelColor[0], pixelColor[1], pixelColor[2], pixelColor[3]];
		const sAlpha = pixelColor[3]/255.0;
		for (let py = y1; py <= y2; ++py) {
			const dy = y1 - y;
			let pidx = (py * this.width() + x1) * 4;
			for (let px = x1; px <= x2; px++) {
				const dx = px - x;
				const rSqrd = dx*dx + dy*dy;
				const rAlpha = 1.0 - step(Math.sqrt(rSqrd), r - 0.5, r + 0.5);
				color[3] = to8Bit(sAlpha*rAlpha);
				this.compositePixel(pidx, color);
				pidx += 4;
			}
		}
	}

	drawSquare(x, y, s, pixelColor) {
		const halfS = (s - 1)/2;
		const x1 = Math.max( x - s/2, 0 ) >> 0;
		const x2 = Math.min( x + s/2 + 1, this.width() - 1 ) >> 0;
		const y1 = Math.max( y - s/2, 0 ) >> 0;
		const y2 = Math.min( y + s/2 + 1, this.height() - 1 ) >> 0;
		const color = [pixelColor[0], pixelColor[1], pixelColor[2], pixelColor[3]];
		const sAlpha = pixelColor[3]/255.0;
		for (let py = y1; py <= y2; ++py) {
			const yAlpha = bridge(py, y - halfS, y + halfS);
			let pidx = (py * this.width() + x1) * 4;
			for (let px = x1; px <= x2; px++) {
				const xAlpha = bridge(px, x - halfS, x + halfS);
				color[3] = to8Bit(sAlpha*xAlpha*yAlpha);
				this.compositePixel(pidx, color);
				pidx += 4;
			}
		}
	}

	drawToCanvas() {
		this.ctx.putImageData(this.imgData, 0, 0);
	}

	// creates an anchor/link that supports saving the imageData to the file, and then clicks itself
	downloadImage(imageFileData, filename) {
		const a = document.createElement('a');
		a.href = imageFileData;
		a.download = filename;
		// no need to add it to the body, it just exists somewhere as a functional anchor/link
		// document.body.appendChild(a);
		a.click();
		// TODO: delete the anchor when done (probably in an async callback)
	}

	// pulls the image file content for the designated file type & quality, and saves it to the local file
	saveToFile(filename, imageType, quality) {
		const imageFileData = this.canvas.toDataURL(imageType, quality);
		this.downloadImage(imageFileData, filename);
	}

};
