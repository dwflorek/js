class AgedConway {
	constructor (width, height) {
		this.width = width;
		this.height = height;
		this.emptyVal = 0;
		this.birthVal = 1;
		this.killVal = -1;

		this.prevGen = new Grid(width, height, this.emptyVal);
		this.currGen = new Grid(width, height, this.emptyVal);
	}

	resize(width, height) {
		// resets to empty grids
		this.prevGen.resize(width, height);
		this.nextGen.resize(width, height);
	}

	clear() {
		this.prevGen.clear(this.emptyVal);
		this.currGen.clear(this.emptyVal);
	}

	// eight neighbors on a rectangular grid
	static #neighborDeltas = [
		[-1, -1], [0, -1], [1, -1],
		[-1,  0],          [1,  0],
		[-1,  1], [0,  1], [1,  1]
	];

	neighborAt(x, y, delta) {
		// implements toroidal wrap-around -- add in this.width/height to guarantee a positive result.
		// (-1 % width = -1, not width-1)
		return [(x + this.width + delta[0]) % this.width, (y + this.height + delta[1]) % this.height];
	}
		
	wasAlive(x, y) {
		return this.prevGen.get(x, y) >= this.birthVal;
	}

	isAlive(x, y) {
		return this.currGen.get(x, y) >= this.birthVal;
	}

	wasDead(x, y) {
		return this.prevGen.get(x, y) <= this.killVal;
	}

	numLivingNeighbors(x, y) {
		let numLiving = 0;
		for (let i = 0; i < AgedConway.#neighborDeltas.length; ++i) {
			const delta = AgedConway.#neighborDeltas[i];
			const neighbor = this.neighborAt(x, y, delta);
			if (this.wasAlive(...neighbor)) {
				numLiving += 1;
			}
		}
		return numLiving;
	}

	// operations on a currGen cell

	birth(x, y) {
		this.currGen.set(x, y, this.birthVal);
	}

	age(x, y) {
		this.currGen.set(x, y, this.prevGen.get(x, y) + 1);
	}

	kill(x, y) {
		this.currGen.set(x, y, this.killVal);
	}

	rot(x, y) {
		this.currGen.set(x, y, this.prevGen.get(x, y) - 1);
	}

	empty(x, y) {
		this.currGen.set(x, y, this.emptyVal);
	}

	val(x, y) {
		return this.currGen.get(x, y);
	}

	// initialize currGen to random arrangement

	randomize(percentLiving) {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				if (randomOn(0, 100) < percentLiving) {
					this.birth(x, y);
				} else {
					this.empty(x, y);
				}
			}
		}
	}
				
	// initialize currGen to desired pattern

	addPattern(x, y, pattern) {
		for (let row = 0; row < pattern.length; ++row) {
			const line = pattern[row];
			for (let col = 0; col < line.length; ++col) {
				if (line.at(col) == '#') {
					this.birth(x + col, y + row);
				} else {
					this.empty(x + col, y + row);
				}
			}
		}
	}

	// determine currGen from prevGen

	evolve() {
		// swap currGen & prevGen -- mostly prevGen <- currGen
		const tmp = this.prevGen;
		this.prevGen = this.currGen;
		this.currGen = tmp;
		// overwrite currGen as the next timestep forward from prevGen
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				const numNeighbors = this.numLivingNeighbors(x, y);
				if (this.wasAlive(x, y)) {
					if (numNeighbors == 2 || numNeighbors == 3) {
						this.age(x, y);
					} else {
						this.kill(x, y);
					}
				} else {
					if (numNeighbors == 3) {
						this.birth(x, y);
					} else if (this.wasDead(x, y)) {
						this.rot(x, y);
					}
				}
			}
		}
	}
}
