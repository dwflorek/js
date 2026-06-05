function uiRandomDiv(ui, applySeedCb) {
	const div = document.createElement('div');
	div.setAttribute('class', 'mainDiv');

	const genRandomSeedCb = function() {
		const seed = (Math.random() * 2**32) >> 0;
		ui.randomSeed.setContent(seed);
		applySeedCb(seed);
	}

	const applyCb = function() {
		const seed = Number(ui.randomSeed.getContent());
		applySeedCb(seed);
	}

	ui.randomSeed = new TextEntry('textField', 'randomSeed', 0xdeadbeef, 'Random Seed');
	ui.genRandomSeedButton = new PushButton('button', 'genRandomSeed', 'Randomize Seed', genRandomSeedCb);
	ui.applyRandomSeedButton = new PushButton('button', 'randomSeedApply', 'Apply Seed', applyCb);

	ui.randomSeed.appendToElement(div);
	ui.genRandomSeedButton.appendToElement(div);
	ui.applyRandomSeedButton.appendToElement(div);

	return div;
}
