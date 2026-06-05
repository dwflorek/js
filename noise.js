class Noise {
	constructor(numGradients) {
		this.numGradients = numGradients;
		this.gradients = [];
		this.permuter = [];
		this.fillGradients();
		this.fillPermuter();

		this.printed = 0;
	}

	fillGradients() {
		while (this.gradients.length < this.numGradients) {
			let x;
			let y;
			let z;
			let rsqrd = 2.0;
			while (rsqrd > 1.0 || rsqrd < 0.001) {
				x = myRandom();
				y = myRandom();
				z = myRandom();
				rsqrd = x*x + y*y + z*z;
			}
			const r = Math.sqrt(rsqrd);
			this.gradients.push([x/r, y/r, z/r]);
		}
	}

	fillPermuter() {
		// initialize permuter
		for (let i = 0; i < this.numGradients; ++i) {
			// each index refers to itself
			this.permuter[i] = i;
		}
		// shuffle values
		// going backwards through the list
		for (let i = this.numGradients - 1; i > 0; --i) {
			// find a value at position <= this one to swap with
			const j = ((i + 1) * myRandom()) >> 0;
			if (j >= i) {
				// keeping this one where it is
				continue;
			}
			// otherwise swap vals at i & j
			const temp = this.permuter[i];
			this.permuter[i] = this.permuter[j];
			this.permuter[j] = temp;
		}
	}

	permute(i) {
		const numWrappings = Math.floor(i / this.numGradients);
		const wrappedI = i - (numWrappings * this.numGradients);
		const perm = this.permuter[wrappedI];
		if (this.printed == 0) {
			console.log(`i: ${i}, numWrappings: ${numWrappings}, wrappedI: ${wrappedI}, perm: ${perm}`);
		}
		return perm;
	}

	getIndexFor(ix, iy, iz) {
		// TODO: I'm pretty sure this will repeat in x, y, & z at numGradients in each direction ...
		//       to get an appearance of further randomness in each direction, that direction's
		//       index should be further tweaked by at least one of the others?
		const index = this.permute(iz + this.permute(iy + this.permute(ix)));
		this.printed = 1;
		return index;
	}

	getValueAt(x, y, z) {
		const ix = Math.floor(x)>>0;
		const fx = x - ix;
		const iy = Math.floor(y)>>0;
		const fy = y - iy;
		const iz = Math.floor(z)>>0;
		const fz = z - iz;
	
		// use permuter to find "random" gradient at each surrounding grid vertex
		const g000 = this.gradients[this.getIndexFor(ix,   iy,   iz  )];
		const g001 = this.gradients[this.getIndexFor(ix+1, iy,   iz  )];
		const g010 = this.gradients[this.getIndexFor(ix,   iy+1, iz  )];
		const g011 = this.gradients[this.getIndexFor(ix+1, iy+1, iz  )];
		const g100 = this.gradients[this.getIndexFor(ix,   iy,   iz+1)];
		const g101 = this.gradients[this.getIndexFor(ix+1, iy,   iz+1)];
		const g110 = this.gradients[this.getIndexFor(ix,   iy+1, iz+1)];
		const g111 = this.gradients[this.getIndexFor(ix+1, iy+1, iz+1)];

		// get contribution from each gradient, based on distance & direction from that vertex
		const v000 = g000[0] * fx         + g000[1] * fy         + g000[2] * fz;
		const v001 = g001[0] * (fx - 1.0) + g001[1] * fy         + g001[2] * fz;
		const v010 = g010[0] * fx         + g010[1] * (fy - 1.0) + g010[2] * fz;
		const v011 = g011[0] * (fx - 1.0) + g011[1] * (fy - 1.0) + g011[2] * fz;
		const v100 = g100[0] * fx         + g100[1] * fy         + g100[2] * (fz - 1.0);
		const v101 = g101[0] * (fx - 1.0) + g101[1] * fy         + g101[2] * (fz - 1.0);
		const v110 = g110[0] * fx         + g110[1] * (fy - 1.0) + g110[2] * (fz - 1.0);
		const v111 = g111[0] * (fx - 1.0) + g111[1] * (fy - 1.0) + g111[2] * (fz - 1.0);

		// trilerp, using smoothed f
		const interpx = fx*fx*(3.0 - 2.0*fx);
		const interpy = fy*fy*(3.0 - 2.0*fy);
		const interpz = fz*fz*(3.0 - 2.0*fz);

		const v00 = v000 + interpx*(v001 - v000);
		const v01 = v010 + interpx*(v011 - v010);
		const v10 = v100 + interpx*(v101 - v100);
		const v11 = v110 + interpx*(v111 - v110);

		const v0 = v00 + interpy*(v01 - v00);
		const v1 = v10 + interpy*(v11 - v10);

		const v = v0 + interpz*(v1 - v0);
		return v;
	}

	getPeriodicValueAt(x, y, z, x_period, y_period, z_period, x_offset, y_offset, z_offset) {
		// start with regular determination of cell and position within it
		let ix = Math.floor(x);
		const fx = x - ix;
		let iy = Math.floor(y);
		const fy = y - iy;
		let iz = Math.floor(z);
		const fz = z - iz;

		// now modify the cell location to be periodic over the specified domains
		ix = (ix - Math.floor((x - x_offset) / x_period) * x_period) >> 0;
		iy = (iy - Math.floor((y - y_offset) / y_period) * y_period) >> 0;
		iz = (iz - Math.floor((z - z_offset) / z_period) * z_period) >> 0;
	
		// ixp1 = ix + 1 (unless we need to wrap around, then it's back to x_offset), same for iy & iz
		const ixp1 = (ix == x_offset + x_period - 1) ? x_offset : ix + 1;
		const iyp1 = (iy == y_offset + y_period - 1) ? y_offset : iy + 1;
		const izp1 = (iz == z_offset + z_period - 1) ? z_offset : iz + 1;

		// use permuter to find "random" gradient at each surrounding grid vertex
		const g000 = this.gradients[this.getIndexFor(ix,   iy,   iz  )];
		const g001 = this.gradients[this.getIndexFor(ixp1, iy,   iz  )];
		const g010 = this.gradients[this.getIndexFor(ix,   iyp1, iz  )];
		const g011 = this.gradients[this.getIndexFor(ixp1, iyp1, iz  )];
		const g100 = this.gradients[this.getIndexFor(ix,   iy,   izp1)];
		const g101 = this.gradients[this.getIndexFor(ixp1, iy,   izp1)];
		const g110 = this.gradients[this.getIndexFor(ix,   iyp1, izp1)];
		const g111 = this.gradients[this.getIndexFor(ixp1, iyp1, izp1)];

		// get contribution from each gradient, based on distance & direction from that vertex
		const v000 = g000[0] * fx         + g000[1] * fy         + g000[2] * fz;
		const v001 = g001[0] * (fx - 1.0) + g001[1] * fy         + g001[2] * fz;
		const v010 = g010[0] * fx         + g010[1] * (fy - 1.0) + g010[2] * fz;
		const v011 = g011[0] * (fx - 1.0) + g011[1] * (fy - 1.0) + g011[2] * fz;
		const v100 = g100[0] * fx         + g100[1] * fy         + g100[2] * (fz - 1.0);
		const v101 = g101[0] * (fx - 1.0) + g101[1] * fy         + g101[2] * (fz - 1.0);
		const v110 = g110[0] * fx         + g110[1] * (fy - 1.0) + g110[2] * (fz - 1.0);
		const v111 = g111[0] * (fx - 1.0) + g111[1] * (fy - 1.0) + g111[2] * (fz - 1.0);

		// trilerp, using smoothed f
		const interpx = fx*fx*(3.0 - 2.0*fx);
		const interpy = fy*fy*(3.0 - 2.0*fy);
		const interpz = fz*fz*(3.0 - 2.0*fz);

		const v00 = v000 + interpx*(v001 - v000);
		const v01 = v010 + interpx*(v011 - v010);
		const v10 = v100 + interpx*(v101 - v100);
		const v11 = v110 + interpx*(v111 - v110);

		const v0 = v00 + interpy*(v01 - v00);
		const v1 = v10 + interpy*(v11 - v10);

		const v = v0 + interpz*(v1 - v0);
		return v;
	}
}



