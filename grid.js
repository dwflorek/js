class Grid {
	constructor(width, height, defaultVal) {
		this.defaultVal = defaultVal;
		this.resize(width, height);
	}

	resize(width, height) {
		this.width = width;
		this.height = height;
		this.cells = [];
		for (let y = 0; y < height; ++y) {
			let row = [];
			for (let x = 0; x < width; ++x) {
				row[x] = this.defaultVal;
			}
			this.cells.push(row);
		}
	}

	clear(clearVal) {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				this.cells[y][x] = clearVal;
			}
		}
	}

	get(x, y) {
		if (0 <= x && x < this.width && 0 <= y && y < this.height) {
			return this.cells[y][x];
		} else {
			return this.defaultVal;
		}
	}

	set(x, y, val) {
		if (0 <= x && x < this.width && 0 <= y && y < this.height) {
			this.cells[y][x] = val;
		}
	}
}
