class Tile {
	constructor(width, height, defaultColor) {
		this.width = width;
		this.height = height;
		this.defaultColor = [...defaultColor];
		this.pixels = [];
		for (let y = 0; y < height; ++y) {
			let row = [];
			for (let x = 0; x < width; ++x) {
				row[x] = this.defaultColor;
			}
			this.pixels.push(row);
		}
	}

	clear() {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				this.pixels[y][x] = this.defaultColor;
			}
		}
	}

	fill(clearColor) {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				this.pixels[y][x] = [...clearColor];
			}
		}
	}

	get(x, y) {
		if (0 <= x && x < this.width && 0 <= y && y < this.height) {
			return this.pixels[y][x];
		} else {
			return this.defaultColor;
		}
	}

	set(x, y, color) {
		if (0 <= x && x < this.width && 0 <= y && y < this.height) {
			this.pixels[y][x] = [...color];
		}
	}
}

class TileRotatorFlipper {
	constructor(tile, rotation, doHFlip, doVFlip) {
		this.tile = tile;
		this.rotation = rotation;
		this.hflip = doHFlip;
		this.vflip = doVFlip;
	}

	_getTileIterationVals() {
		let tileStartX = 0, tileDx = 1, tileStartY = 0, tileDy = 1;
		if (this.rotation == 0) {
			if (this.hflip) {
				// left col in target <- right col in tile
				tileStartX = this.tile.width - 1;
				tileDx = -1;
			}
			if (this.vflip) {
				// top row in target <- bottom row in tile
				tileStartY = this.tile.height - 1;
				tileDY = -1;
			}
		}
		else if (this.rotation == 90) {
			if (this.mirror) {
				// top row in Img <- left col (top to bottom) in tile
				// no changes
			}
			else {
				// top row in Img <- right col (top to bottom) in tile
				tileStartX = this.tile.width - 1;
				tileDx = -1;
			}
		}
		else if (this.rotation == 180) {
			if (this.mirror) {
				// top row in Img <- bottom row (left to right) in tile
				tileStartY = this.tile.height - 1;
				tileDy = -1;
			}
			else {
				// top row in Img <- bottom row (right to left) in tile
				tileStartY = this.tile.height - 1;
				tileDy = -1;
				tileStartX = this.tile.width - 1;
				tileDx = -1;
			}
		}
		else if (this.rotation == 270) {
			if (this.mirror) {
				// top row in Img <- right col (bottom to top) in tile
				tileStartY = this.tile.height - 1;
				tileDy = -1;
				tileStartX = this.tile.width - 1;
				tileDx = -1;
			}
			else {
				// top row in Img <- left col (bottom to top) in tile
				tileStartY = this.tile.height - 1;
				tileDy = -1;
			}
		}
		return [tileStartX, tileDx, tileStartY, tileDy];
	}

	// composite rotated/mirrored tile into specified position in the Img
	drawToImage(img, ix, iy) {
		const tileIterationVals = this._getTileIterationVals();
		const tileStartX = tileIterationVals[0], tileDx = tileIterationVals[1];
		const tileStartY = tileIterationVals[2], tileDy = tileIterationVals[3];
		if (this.rotation == 90 || this.rotation == 270) {
			// tile x corresponds to img y (and vice versa)
			for (let y = 0, tx = tileStartX; y < this.tile.height; ++y, tx += tileDx) {
				for (let x = 0, ty = tileStartY; x < this.tile.width; ++x, ty += tileDy) {
					img.compositePixelXY(ix + x, iy + y, this.tile.get(tx, ty));
				}
			}
		}
		else {
			// tile x corresponds to img x (and same for y)
			for (let y = 0, ty = tileStartY; y < this.tile.height; ++y, ty += tileDy) {
				for (let x = 0, tx = tileStartX; x < this.tile.width; ++x, tx += tileDx) {
					img.compositePixelXY(ix + x, iy + y, this.tile.get(tx, ty));
				}
			}
		}
	}

	// copy rotated/mirrored tile into specified position in the given Tile
	drawToTile(tile, ix, iy) {
		const tileIterationVals = this._getTileIterationVals();
		const tileStartX = tileIterationVals[0], tileDx = tileIterationVals[1];
		const tileStartY = tileIterationVals[2], tileDy = tileIterationVals[3];
		if (this.rotation == 90 || this.rotation == 270) {
			// tile x corresponds to img y (and vice versa)
			for (let y = 0, tx = tileStartX; y < this.tile.height; ++y, tx += tileDx) {
				for (let x = 0, ty = tileStartY; x < this.tile.width; ++x, ty += tileDy) {
					tile.set(ix + x, iy + y, this.tile.get(tx, ty));
				}
			}
		}
		else {
			// tile x corresponds to img x (and same for y)
			for (let y = 0, ty = tileStartY; y < this.tile.height; ++y, ty += tileDy) {
				for (let x = 0, tx = tileStartX; x < this.tile.width; ++x, tx += tileDx) {
					tile.set(ix + x, iy + y, this.tile.get(tx, ty));
				}
			}
		}
	}
}
