class MultivalueConway {
	constructor (width, height) {
		this.width = width;
		this.height = height;
		this.killVal = 0
		// other cell values will be 1, 2, 3 or 4

		this.prevGen = new Grid(width, height, this.killVal);
		this.currGen = new Grid(width, height, this.killVal);
	}

	resize(width, height) {
		// resets to empty grids
		this.prevGen.resize(width, height);
		this.nextGen.resize(width, height);
	}

	clear(clearVal) {
		this.currGen.clear(clearVal);
		this.prevGen.clear(clearVal);
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
		return this.prevGen.get(x, y) != this.killVal;
	}

	isAlive(x, y) {
		return this.currGen.get(x, y) != this.killVal;
	}

	getLivingNeighbors(x, y) {
		let numLiving = 0;
		let liveNeighborVals = [];
		for (let i = 0; i < MultivalueConway.#neighborDeltas.length; ++i) {
			const delta = MultivalueConway.#neighborDeltas[i];
			const neighbor = this.neighborAt(x, y, delta);
			if (this.wasAlive(...neighbor)) { 
				liveNeighborVals.push(this.prevVal(...neighbor));
			}
		}
		return liveNeighborVals;
	}

	// operations on a currGen cell

	birth(x, y, val) {
		this.currGen.set(x, y, val);
	}

	age(x, y) {
		this.currGen.set(x, y, this.prevGen.get(x, y));
	}

	kill(x, y) {
		this.currGen.set(x, y, this.killVal);
	}

	rot(x, y) {
		this.currGen.set(x, y, this.prevGen.get(x, y));
	}

	val(x, y) {
		return this.currGen.get(x, y);
	}

	prevVal(x, y) {
		return this.prevGen.get(x, y);
	}
	
	// initialize currGen to random arrangement

	randomize(percentLiving) {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				if (randomOn(0, 100) < percentLiving) {
					this.birth(x, y, randomOn(1, 5)>>0);
				} else {
					this.kill(x, y);
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
					this.birth(x + col, y + row, randomOn(1, 5)>>0);
				} else {
					this.kill(x + col, y + row);
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
				const liveNeighbors = this.getLivingNeighbors(x, y);
				const numNeighbors = liveNeighbors.length;
				if (this.wasAlive(x, y)) {
					if (liveNeighbors.length == 2 || liveNeighbors.length == 3) {
						this.age(x, y);
					} else {
						this.kill(x, y);
					}
				} else {
					if (liveNeighbors.length == 3) {
						let valSum = 0;
						let valCounts = {1: 0, 2: 0, 3: 0, 4: 0};
						liveNeighbors.forEach(
							function(currentVal, index, arr) {
								valSum += currentVal;
								valCounts[currentVal] += 1;
							}
						);
						let birthed = false;
						for (let v = 1; v <= 4; ++v) {
							if (valCounts[v] > 1) {
								// at least two (of three) neighbors have the same val
								this.birth(x, y, v);
								birthed = true;
								break;
							}
						}
						if (!birthed) {
							// all three neighbors have different vals, pick the fourth
							this.birth(x, y, 10 - valSum);
						}
					} else {
						this.rot(x, y);
					}
				}
			}
		}
	}
}
