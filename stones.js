	// <input type="text" class="textField" id="centerX">
	// <label for="centerX">Center X (across image)</label><br/>
	class TextEntry {
		constructor(className, elementId, defaultVal, labelText) {
			this.defaultVal = defaultVal;

			this.element = document.createElement('input');
			this.element.setAttribute('type', 'text');
			this.element.setAttribute('class', className);
			this.element.setAttribute('id', elementId);

			this.label = document.createElement('label');
			this.label.setAttribute('for', elementId);
			const labelContent = document.createTextNode(labelText);
			this.label.appendChild(labelContent);
		}
		appendToElement(el) {
			el.appendChild(this.element);
			el.appendChild(this.label);
			el.appendChild(document.createElement('br'));
		}
		getAttribute(attr) {
			return this.element.getAttribute(attr);
		}
		getContent() {
			let value = this.element.value;
			if (value === undefined || value === null || value === '') {
				value = this.defaultVal;
				this.elemenet.value = value;
			}
			return value;
		}
		getNumericContent() {
			return Number(this.getContent());
		}
		setContent = function(value) {
			this.element.value = value;
		}
	}

	// <button class="button" type="button" onclick="addStone()">Add</button>
	// <button class="button" type="button" id="go_stop" ></button>
	class PushButton {
		constructor(className, elementId, text, callback) {
			this.label = document.createTextNode(text);
			this.callback = callback;

			this.element = document.createElement('button');
			this.element.setAttribute('type', 'button');
			this.element.setAttribute('class', className);
			this.element.setAttribute('id', elementId);
			this.element.appendChild(this.label);
			this.element.addEventListener("click", callback);
		}
		appendToElement(el) {
			el.appendChild(this.element);
		}
		getAttribute(attr) {
			return this.element.getAttribute(attr);
		}
		updateState(text, callback) {
			this.label.remove();
			this.label = document.createTextNode(text);
			this.element.appendChild(this.label);

			this.element.removeEventListener("click", this.callback);
			this.element.addEventListener("click", callback);
			this.callback = callback;
		}
	}

	function randomOn(a, b) {
		return a + Math.random() * (b - a);
	}

	function wrapOntoZeroOne(val) {
		let isNeg = false;
		if (val < 0.0) {
			isNeg = true;
			val = -val;
		}
		val = val - (val>>0);
		if (isNeg) {
			val = 1.0 - val;
		}
		return val;
	}

	function smoothStep(val, lo, hi) {
		if (val < lo) {
			return 0.0;
		}
		else if (val > hi) {
			return 1.0;
		}
		else {
			const t = (val - lo) / (hi - lo);
			return t*t*(3.0 - 2.0*t);
		}
	}

	function hsvToRgb(hue, sat, val) {
		hue = wrapOntoZeroOne(hue);
                hue = hue * 6;
		const hBand = hue>>0;
		const hFrac = hue - hBand;
		const high = val;
		const low = (1.0 - sat)*high;
		const mid1 = low + hFrac*(high - low);;
		const mid2 = high - hFrac*(high - low);;
		if (hBand == 0) {
			return [high, mid1, low];
		}
		if (hBand == 1) {
			return [mid2, high, low];
		}
		if (hBand == 2) {
			return [low, high, mid1];
		}
		if (hBand == 3) {
			return [low, mid2, high];
		}
		if (hBand == 4) {
			return [mid1, low, high];
		}
		else {
			return [high, low, mid2];
		}
	}

	function clamp(x, lo, hi) {
		if (x < lo) {
			return lo;
		}
		if (x > hi) {
			return hi;
		}
		return x;
	}

	function scaleVector(v, s) {
		return [s*v[0], s*v[1], s*v[2]];
	}

	function dotProduct(v1, v2) {
		return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
	}

	function normalize(vx, vy, vz) {
		const normFactor = 1.0 / Math.sqrt(vx*vx + vy*vy + vz*vz);
		return [vx*normFactor, vy*normFactor, vz*normFactor];
	}

	function to8Bit(x) {
		const i = (256*x)>>0;
		return clamp(i, 0, 255);
	}

	function getRandomColor() {
		const val = randomOn(0.5, 0.8); // medium to brightish (where lit)
		const sat = randomOn(0.0, 0.3); // dulled color
		const hue = randomOn(0.05, 0.45); // orange of red to green of cyan
                const rgb = hsvToRgb(hue, sat, val);
		return [to8Bit(rgb[0]), to8Bit(rgb[1]), to8Bit(rgb[2])]
	}

	class Stones {

		static #stones = [];

		static clear() {
			Stones.#stones = [];
		}
		static add(stone) {
			Stones.#stones.push(stone);
		}
		static count() {
			return Stones.#stones.length;
		}
		static draw(imgData) {
			for (let s = 0; s < Stones.#stones.length; ++s) {
				Stones.#stones[s].draw(imgData);
			}
		}
		static log() {
			console.log(`stones: ${Stones.count()} [${Stones.#stones}]`);
		}
	}

	class Stone {
	
		constructor(centerX, centerY, angle, r1, r2, color) {
			this.cX = centerX;
			this.cY = centerY;
			this.ang = angle;
			this.rMaj = Math.max(r1, r2);
			this.rMin = Math.min(r1, r2);
			this.color = color;
		}
		static addFromUI() {
			const stone = new Stone(
				Number(ui.centerX.getContent()),
				Number(ui.centerY.getContent()),
				Number(ui.angle.getContent()),
				Number(ui.radius1.getContent()),
				Number(ui.radius2.getContent()),
				getRandomColor());
			/*
			console.log(
				`stone: ${Stones.count()}, x: ${stone.cX}, y: ${stone.cY}, ang: ${stone.ang},`,
				`rMajor: ${stone.rMaj}, rMinor: ${stone.rMin},`,
				`color: ${stone.color[0]} ${stone.color[1]} ${stone.color[2]}`);
			*/
			Stones.add(stone);
			drawScene(); // TODO: move this out of class
		}
		static addRandom() {
			const width = document.getElementById('stones').width;
			const height = document.getElementById('stones').height;
			ui.centerX.setContent(randomOn(0.0, width));
			ui.centerY.setContent(randomOn(0.0, height));
			ui.angle.setContent(randomOn(0.0, 360.0));
			ui.radius1.setContent(randomOn(20.0, 100.0));
			ui.radius2.setContent(randomOn(20.0, 100.0));
			Stone.addFromUI();
		}

		static #stoneThickness = 2.0;

		static #lDir = normalize(1.0, 2.0, 0.5);
		static #Kd = 0.7;
		static #lColor = [1.0, 1.0, 0.8];
		static #Ka = 0.3;
		static #aColor = [0.5, 0.5, 0.8];

		draw(imageData) {
			const rMax = this.rMaj + 1;
			const cAng = Math.cos(this.ang * Math.PI/180.0);
			const sAng = Math.sin(this.ang * Math.PI/180.0);
			// let logged = 0;
			for (let y = Math.floor(this.cY - rMax)>>0; y < this.cY + rMax; ++y) {
				if (y < 0 || y > imageData.height - 1) {
					continue;
				}
				const xStart = Math.floor(this.cX - rMax)>>0;
				let pixelIndex = (y * imageData.width + xStart) * 4;
				for (let x = xStart; x < this.cX + rMax; ++x) {
					if (x < 0 || x > imageData.width - 1) {
						pixelIndex += 4;
						continue;
					}
					// stone-pt is (x, y) relative to stone-center
					const stoneX =   x - this.cX;
					const stoneY = -(y - this.cY);
					// rotated stone-pt is (x, y) relative to axis-aligned stone
					const rotStoneX =  cAng * stoneX + sAng * stoneY;
					const rotStoneY = -sAng * stoneX + cAng * stoneY;
					// sphere-pt is rotated stone-pt scaled: (x, y) relative to unit sphere
					const sphereX = rotStoneX / this.rMaj;
					const sphereY = rotStoneY / this.rMin;
	
					// find nearby point on edge of stone (in dir from center)
					const sphereEdgeP = normalize(sphereX, sphereY, 0.0);
					const stoneEdgeP = [sphereEdgeP[0] * this.rMaj, sphereEdgeP[1] * this.rMin];
					const stoneEdgeN = normalize(
						sphereEdgeP[0] / this.rMaj,
						sphereEdgeP[1] / this.rMin,
						0.0);
					// compute approx distance to edge as: distance to point, scaled by cos(angle(dirToPt, normAtPt))
					// = ||pt - rotStonePt|| * ( ((pt - rotStonePt)/||pt - rotStonePt||) . edgeN )
					// = (pt - rotStonePt) . edgeN
					const distToEdge = (stoneEdgeP[0] - rotStoneX)*stoneEdgeN[0] + (stoneEdgeP[1] - rotStoneY)*stoneEdgeN[1];

					/*
					if (!logged) {
						console.log(`pixel [${x}, ${y}], sphere [${sphereX}, ${sphereY}], sphereEdge [${sphereEdgeP}], ` +
					            	`stoneEdge [${stoneEdgeP}], dist ${distToEdge}`);
						logged = 1;
					}
					*/

					// alpha = 0 at 0.5 beyond edge, 1 at 0.5 within edge
					const alpha = clamp(distToEdge + 0.5, 0.0, 1.0);
					if (alpha <= 0.0) {
						pixelIndex += 4;
						continue;
					}
				
					// compute Z, find normal
					const rSqrd = sphereX*sphereX + sphereY*sphereY;
					const sphereZ = rSqrd > 1.0 ? 0.0 : Math.sqrt(1.0 - rSqrd);
					const stoneN = normalize(
						sphereX / this.rMaj,
						sphereY / this.rMin,
						sphereZ / Stone.#stoneThickness);

					// rotate normal back
					const n = [
						cAng * stoneN[0] - sAng * stoneN[1],
						sAng * stoneN[0] + cAng * stoneN[1],
						stoneN[2]
					];

					// illuminate surface based on normal
					const l_dot_n = dotProduct(Stone.#lDir, n);
					let illum = scaleVector(Stone.#aColor, Stone.#Ka);
					if (l_dot_n > 0.0) {
						const diffuse = scaleVector(Stone.#lColor, Stone.#Kd*l_dot_n);
						for (var c = 0; c < 3; ++c) {
							illum[c] += diffuse[c];
						}
					}
					let color = [];
					for (var c = 0; c < 3; ++c) {
						color.push(Math.round(illum[c] * this.color[c])>>0);
					}
					compositePixel(
						[color[0], color[1], color[2], to8Bit(alpha)],
						imageData, pixelIndex);

					pixelIndex += 4;
				}
			}
		}
	}

	function colorPixel(imageData, pixelIndex, color) {
                imageData.data[pixelIndex] = color[0];
                imageData.data[pixelIndex+1] = color[1];
                imageData.data[pixelIndex+2] = color[2];
                imageData.data[pixelIndex+3] = color[3];
	}
		
	function clearImage(imageData, color) {
		var row, col, pidx;
		pidx = 0;
		for (row = 0; row < imageData.height; ++row) {
			for (col = 0; col < imageData.width; ++col) {
				colorPixel(imageData, pidx, color);
				pidx += 4;
			}
		}
	}

	function compositePixel(color, imageData, pixelIndex) {
		if (color[3] == 0) {
			// do nothing
		}
		else if (color[3] == 255) {
			colorPixel(imageData, pixelIndex, color);
		}
		else {
			var base = [
				imageData.data[pixelIndex],
				imageData.data[pixelIndex+1],
				imageData.data[pixelIndex+2],
				imageData.data[pixelIndex+3],
			]
			var outColor = [];
			var baseAlpha = base[3]/255.0;
			var alpha = color[3]/255.0;
			var outAlpha = alpha + baseAlpha*(1.0 - alpha);
			var i;
			for (i = 0; i < 3; ++i) {
				outColor.push(
					Math.round((color[i]*alpha + base[i]*baseAlpha*(1.0 - alpha)) / outAlpha)>>0
				);
			}
			outColor.push( Math.round(255 * outAlpha)>>0 );
			colorPixel(imageData, pixelIndex, outColor);
		}
	}
	
	function drawScene() {
		const canvas = document.getElementById('stones');
		let ctx = canvas.getContext("2d");
		let imgData = ctx.createImageData(canvas.width, canvas.height); // match to canvas (for now)
	
		clearImage(imgData, [0, 0, 0, 255]); // [34, 22, 84, 255]);
		Stones.draw(imgData);
		ctx.putImageData(imgData, 0, 0);
	}
	
	function reset() {
		stopRunning();
		Stones.clear();
		drawScene();
	}

	let isRunning = false;
	let runTimer = null;

	function updateGoButton() {
		if (isRunning) {
			ui.goStopButton.updateState('Stop', stopRunning);
		} else {
			ui.goStopButton.updateState('Run', startRunning);
		}
	}

	function startRunning() {
		if (!isRunning) {
			isRunning = true;
			updateGoButton();
			runTimer = setInterval(Stone.addRandom, 500);
		}
	} 

	function stopRunning() {
		if (isRunning) {
			isRunning = false;
			clearInterval(runTimer);
			updateGoButton();
		}
	}

	let ui = {};

	function buildUI() {
		ui.centerX = new TextEntry('textField', 'centerX', 100.0, 'Center X (across image)');
		ui.centerY = new TextEntry('textField', 'centerY', 100.0, 'Center Y (down image)');
		ui.angle = new TextEntry('textField', 'angle', 0.0, 'Angle of rotation (degrees)');
		ui.radius1 = new TextEntry('textField', 'radius1', 0.0, 'Major radius (pixels, in angle direction)');
		ui.radius2 = new TextEntry('textField', 'radius2', 0.0, 'Minor radius (pixels, opposite angle direction)');
		ui.addButton = new PushButton('button', 'add', 'Add', Stone.addFromUI);
		ui.addRandomButton = new PushButton('button', 'addRandom', 'Add Random', Stone.addRandom);
		ui.clearButton = new PushButton('button', 'clear', 'Clear', reset);
		ui.goStopButton = new PushButton('button', 'go_stop', '');

		const controlsDiv = document.getElementById('controls');
		ui.centerX.appendToElement(controlsDiv);
		ui.centerY.appendToElement(controlsDiv);
		ui.angle.appendToElement(controlsDiv);
		ui.radius1.appendToElement(controlsDiv);
		ui.radius2.appendToElement(controlsDiv);
		ui.addButton.appendToElement(controlsDiv);
		ui.addRandomButton.appendToElement(controlsDiv);
		ui.clearButton.appendToElement(controlsDiv);
		ui.goStopButton.appendToElement(controlsDiv);

		/*
		console.log(
			"addRandomButton",
			`class: ${ui.addRandomButton.getAttribute('class')},`,
			`id: ${ui.addRandomButton.getAttribute('id')},`,
			`label: "${ui.addRandomButton.label.textContent}"`);
		console.log(
			"centerXEntry",
			`class: ${ui.centerX.getAttribute('class')},`,
			`id: ${ui.centerX.getAttribute('id')},`,
			`label: "${ui.centerX.label.textContent}"`);
		*/
	}

	function initFromParams() {
	}
